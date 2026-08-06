import Konva from 'konva';

const TYPE_LABELS = {
  title: 'TÍTULO', text: 'TEXTO', box: 'BLOCO', group: 'GRUPO', image: 'IMAGEM', code: 'CÓDIGO',
  api: 'API', database: 'BANCO', server: 'SERVIDOR', person: 'PESSOA', company: 'EMPRESA',
  document: 'DOCUMENTO', process: 'PROCESSO', decision: 'DECISÃO', list: 'LISTA', table: 'TABELA',
  step: 'ETAPA', goal: 'OBJETIVO', milestone: 'MARCO'
};

export class CanvasEngine {
  constructor(bus, container) {
    this.bus = bus;
    this.container = container;
    this.shapes = new Map();
    this.edgeShapes = new Map();
    this.nodes = [];
    this.edges = [];
    this.active = false;
    this.stage = new Konva.Stage({ container, width: container.clientWidth, height: container.clientHeight, draggable: false });
    this.edgeLayer = new Konva.Layer({ listening: false });
    this.nodeLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();
    this.stage.add(this.edgeLayer, this.nodeLayer, this.uiLayer);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.register();
    this.bindStage();
  }

  register() {
    this.bus.handle('engine:stage', () => this.stage);
    this.bus.handle('engine:layer', name => name === 'ui' ? this.uiLayer : this.nodeLayer);
    this.bus.handle('engine:shape', id => this.shapes.get(id) || null);
    this.bus.handle('engine:activate', active => { this.active = active; if (active) this.resize(); });
    this.bus.on('nodes:changed', ({ nodes }) => { this.nodes = nodes; this.render(); });
    this.bus.on('edges:changed', edges => { this.edges = edges; this.renderEdges(); });
    this.bus.on('viewport:changed', () => this.render());
  }

  bindStage() {
    this.stage.on('click tap', event => {
      const group = event.target.findAncestor('.canvas-node', true);
      this.bus.emit('canvas:clicked', { id: group?.id() || null, event: event.evt });
    });
    this.stage.on('dragstart', event => {
      if (event.target === this.stage) this.container.classList.add('is-panning');
    });
    this.stage.on('dragend', event => {
      this.container.classList.remove('is-panning');
      if (event.target === this.stage) this.emitViewport();
    });
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.stage.size({ width, height });
    this.stage.batchDraw();
    this.emitViewport();
  }

  emitViewport() {
    this.bus.emit('viewport:changed', {
      x: this.stage.x(), y: this.stage.y(), scale: this.stage.scaleX() || 1,
      width: this.stage.width(), height: this.stage.height()
    });
  }

  visibleBounds() {
    const scale = this.stage.scaleX() || 1;
    const padding = 500 / scale;
    return {
      left: -this.stage.x() / scale - padding,
      top: -this.stage.y() / scale - padding,
      right: (-this.stage.x() + this.stage.width()) / scale + padding,
      bottom: (-this.stage.y() + this.stage.height()) / scale + padding
    };
  }

  render() {
    if (!this.active) return;
    const bounds = this.visibleBounds();
    const visible = new Set();
    this.nodes.forEach(node => {
      if (node.x + node.width < bounds.left || node.x > bounds.right || node.y + node.height < bounds.top || node.y > bounds.bottom) return;
      visible.add(node.id);
      this.upsertNode(node);
    });
    [...this.shapes].forEach(([id, shape]) => {
      if (!visible.has(id)) { shape.destroy(); this.shapes.delete(id); }
    });
    this.renderEdges();
    this.nodeLayer.batchDraw();
    this.bus.emit('engine:rendered', { rendered: this.shapes.size, total: this.nodes.length });
  }

  upsertNode(node) {
    let group = this.shapes.get(node.id);
    if (!group) {
      group = this.createNode(node);
      this.shapes.set(node.id, group);
      this.nodeLayer.add(group);
    }
    group.position({ x: node.x, y: node.y });
    group.setAttrs({ width: node.width, height: node.height });
    const background = group.findOne('.node-background');
    background?.setAttrs({ width: node.width, height: node.height, fill: node.color, stroke: node.groupId ? '#8b5cf6' : '#263244' });
    group.findOne('.node-accent')?.setAttrs({ height: node.height - 20, fill: node.accent });
    group.findOne('.node-type')?.setAttrs({ text: TYPE_LABELS[node.type] || 'BLOCO', fill: node.accent, width: node.width - 36 });
    group.findOne('.node-title')?.setAttrs({ text: node.title, fill: '#eef4ff', width: node.width - 36 });
    group.findOne('.node-content')?.setAttrs({ text: node.content, fill: '#94a3b8', width: node.width - 36, height: Math.max(20, node.height - 66) });
  }

  createNode(node) {
    const group = new Konva.Group({ id: node.id, name: 'canvas-node', x: node.x, y: node.y, width: node.width, height: node.height, draggable: true });
    const background = new Konva.Rect({ name: 'node-background', width: node.width, height: node.height, fill: node.color, stroke: '#263244', strokeWidth: 1, cornerRadius: 8, shadowColor: '#000000', shadowBlur: 18, shadowOpacity: 0.3, shadowOffsetY: 5 });
    const accent = new Konva.Rect({ name: 'node-accent', x: 10, y: 10, width: 3, height: node.height - 20, fill: node.accent, cornerRadius: 2, listening: false });
    const type = new Konva.Text({ name: 'node-type', x: 22, y: 15, width: node.width - 36, text: TYPE_LABELS[node.type] || 'BLOCO', fill: node.accent, fontFamily: 'Inter', fontSize: 9, fontStyle: 'bold', listening: false });
    const title = new Konva.Text({ name: 'node-title', x: 22, y: 34, width: node.width - 36, text: node.title, fill: '#eef4ff', fontFamily: 'Inter', fontSize: node.type === 'title' ? 18 : 14, fontStyle: 'bold', lineHeight: 1.2, listening: false });
    const content = new Konva.Text({ name: 'node-content', x: 22, y: 61, width: node.width - 36, height: Math.max(20, node.height - 66), text: node.content, fill: '#94a3b8', fontFamily: 'Inter', fontSize: 10, lineHeight: 1.35, ellipsis: true, listening: false });
    group.add(background, accent, type, title, content);
    group.on('dragmove', () => {
      const snap = this.bus.request('settings:get').snap;
      if (snap) group.position({ x: Math.round(group.x() / 16) * 16, y: Math.round(group.y() / 16) * 16 });
      this.renderEdges(true);
    });
    group.on('dragend', () => this.bus.request('command:execute', { action: 'moveNode', id: node.id, x: group.x(), y: group.y(), label: 'Mover bloco' }));
    group.on('transformend', () => {
      const patch = { x: group.x(), y: group.y(), width: Math.max(140, group.width() * group.scaleX()), height: Math.max(64, group.height() * group.scaleY()) };
      group.scale({ x: 1, y: 1 });
      this.bus.request('command:execute', { action: 'updateNode', id: node.id, patch, label: 'Redimensionar bloco' });
    });
    group.on('dblclick dbltap', () => this.bus.emit('node:edit-request', node.id));
    return group;
  }

  renderEdges(live = false) {
    if (!this.active) return;
    const valid = new Set();
    this.edges.forEach(edge => {
      const from = this.pointFor(edge.from, true);
      const to = this.pointFor(edge.to, false);
      if (!from || !to) return;
      valid.add(edge.id);
      let arrow = this.edgeShapes.get(edge.id);
      const points = [from.x, from.y, from.x + 70, from.y, to.x - 70, to.y, to.x, to.y];
      if (!arrow) {
        arrow = new Konva.Arrow({ id: edge.id, points, stroke: edge.color, fill: edge.color, strokeWidth: 1.4, pointerLength: 7, pointerWidth: 7, bezier: true, opacity: 0.72, dash: edge.style === 'dashed' ? [7, 5] : [] });
        this.edgeShapes.set(edge.id, arrow);
        this.edgeLayer.add(arrow);
      } else arrow.points(points);
    });
    [...this.edgeShapes].forEach(([id, shape]) => { if (!valid.has(id)) { shape.destroy(); this.edgeShapes.delete(id); } });
    this.edgeLayer.batchDraw();
    if (!live) this.bus.emit('edges:rendered', this.edgeShapes.size);
  }

  pointFor(id, outgoing) {
    const shape = this.shapes.get(id);
    const data = this.nodes.find(node => node.id === id);
    if (!data) return null;
    return { x: (shape?.x() ?? data.x) + (outgoing ? data.width : 0), y: (shape?.y() ?? data.y) + data.height / 2 };
  }

  dispose() { this.resizeObserver.disconnect(); this.stage.destroy(); }
}

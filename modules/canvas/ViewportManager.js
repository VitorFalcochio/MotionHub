export class ViewportManager {
  constructor(bus) {
    this.bus = bus;
    this.stage = bus.request('engine:stage');
    this.scaleBy = 1.08;
    this.bind();
    bus.handle('viewport:center', () => this.center());
    bus.handle('viewport:state', () => this.state());
    bus.handle('viewport:zoom', delta => this.zoom(delta));
    bus.on('viewport:fit', () => this.fit());
    bus.on('viewport:focus', id => this.focus(id));
  }

  bind() {
    this.stage.on('wheel', event => {
      event.evt.preventDefault();
      const pointer = this.stage.getPointerPosition();
      const oldScale = this.stage.scaleX();
      const mousePoint = { x: (pointer.x - this.stage.x()) / oldScale, y: (pointer.y - this.stage.y()) / oldScale };
      const direction = event.evt.deltaY > 0 ? -1 : 1;
      const scale = Math.min(2.5, Math.max(0.18, direction > 0 ? oldScale * this.scaleBy : oldScale / this.scaleBy));
      this.stage.scale({ x: scale, y: scale });
      this.stage.position({ x: pointer.x - mousePoint.x * scale, y: pointer.y - mousePoint.y * scale });
      this.changed();
    });
    this.stage.on('dragmove', event => { if (event.target === this.stage) this.changed(); });
  }

  center() {
    const scale = this.stage.scaleX();
    return { x: (this.stage.width() / 2 - this.stage.x()) / scale - 105, y: (this.stage.height() / 2 - this.stage.y()) / scale - 52 };
  }

  state() { return { x: this.stage.x(), y: this.stage.y(), scale: this.stage.scaleX(), width: this.stage.width(), height: this.stage.height() }; }

  zoom(delta) {
    const old = this.stage.scaleX();
    const next = Math.min(2.5, Math.max(0.18, old + delta));
    const center = { x: this.stage.width() / 2, y: this.stage.height() / 2 };
    const world = { x: (center.x - this.stage.x()) / old, y: (center.y - this.stage.y()) / old };
    this.stage.scale({ x: next, y: next });
    this.stage.position({ x: center.x - world.x * next, y: center.y - world.y * next });
    this.changed();
  }

  fit() {
    const nodes = this.bus.request('nodes:list');
    if (!nodes.length) return;
    const minX = Math.min(...nodes.map(node => node.x));
    const minY = Math.min(...nodes.map(node => node.y));
    const maxX = Math.max(...nodes.map(node => node.x + node.width));
    const maxY = Math.max(...nodes.map(node => node.y + node.height));
    const padding = 130;
    const scale = Math.min(1.15, Math.max(0.2, Math.min((this.stage.width() - padding) / (maxX - minX), (this.stage.height() - padding) / (maxY - minY))));
    this.stage.scale({ x: scale, y: scale });
    this.stage.position({ x: (this.stage.width() - (maxX - minX) * scale) / 2 - minX * scale, y: (this.stage.height() - (maxY - minY) * scale) / 2 - minY * scale });
    this.changed();
  }

  focus(id) {
    const node = this.bus.request('nodes:get', id);
    if (!node) return;
    const scale = Math.max(this.stage.scaleX(), 0.85);
    this.stage.scale({ x: scale, y: scale });
    this.stage.position({ x: this.stage.width() / 2 - (node.x + node.width / 2) * scale, y: this.stage.height() / 2 - (node.y + node.height / 2) * scale });
    this.changed();
  }

  changed() {
    this.stage.batchDraw();
    this.bus.emit('viewport:changed', this.state());
  }
}

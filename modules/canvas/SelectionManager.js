import Konva from 'konva';

export class SelectionManager {
  constructor(bus, root) {
    this.bus = bus;
    this.root = root;
    this.ids = [];
    this.stage = bus.request('engine:stage');
    this.layer = bus.request('engine:layer', 'ui');
    this.transformer = new Konva.Transformer({ borderStroke: '#2563eb', borderStrokeWidth: 1.5, anchorFill: '#fff', anchorStroke: '#2563eb', anchorSize: 8, rotateAnchorOffset: 20, padding: 4, keepRatio: false });
    this.layer.add(this.transformer);
    bus.handle('selection:get', () => [...this.ids]);
    bus.handle('selection:set', ids => this.set(ids));
    bus.on('canvas:clicked', payload => this.clicked(payload));
    bus.on('engine:rendered', () => this.syncTransformer());
    this.bindKeyboard();
  }

  clicked({ id, event }) {
    if (!id) return this.set([]);
    const additive = event?.shiftKey || event?.ctrlKey || event?.metaKey;
    if (!additive) return this.set([id]);
    this.set(this.ids.includes(id) ? this.ids.filter(value => value !== id) : [...this.ids, id]);
  }

  set(ids = []) {
    this.ids = [...new Set(ids)].filter(id => this.bus.request('nodes:get', id));
    this.syncTransformer();
    this.bus.emit('selection:changed', { ids: [...this.ids], nodes: this.ids.map(id => this.bus.request('nodes:get', id)) });
    return this.ids;
  }

  syncTransformer() {
    const shapes = this.ids.map(id => this.bus.request('engine:shape', id)).filter(Boolean);
    this.transformer.nodes(shapes);
    this.layer.batchDraw();
  }

  bindKeyboard() {
    window.addEventListener('keydown', event => {
      if (!this.root.isConnected || !document.getElementById('section-canvas')?.classList.contains('active')) return;
      if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      const modifier = event.ctrlKey || event.metaKey;
      if ((event.key === 'Delete' || event.key === 'Backspace') && this.ids.length) this.bus.request('command:execute', { action: 'delete', ids: this.ids, label: 'Excluir blocos' });
      if (modifier && event.key.toLowerCase() === 'c') this.bus.request('command:execute', { action: 'copy', ids: this.ids });
      if (modifier && event.key.toLowerCase() === 'v') this.bus.request('command:execute', { action: 'paste', label: 'Colar blocos' });
      if (modifier && event.key.toLowerCase() === 'd') { event.preventDefault(); this.bus.request('command:execute', { action: 'duplicate', ids: this.ids, label: 'Duplicar blocos' }); }
      if (modifier && event.key.toLowerCase() === 'g') { event.preventDefault(); this.bus.request('command:execute', { action: event.shiftKey ? 'ungroup' : 'group', ids: this.ids, label: event.shiftKey ? 'Desagrupar' : 'Agrupar' }); }
      if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); this.bus.request('command:execute', { action: event.shiftKey ? 'redo' : 'undo' }); }
    });
  }
}

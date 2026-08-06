export class EdgeManager {
  constructor(bus) {
    this.bus = bus;
    this.edges = new Map();
    bus.handle('edges:list', () => this.list());
    bus.handle('edges:add', edge => this.add(edge));
    bus.handle('edges:remove', ids => this.remove(ids));
    bus.handle('edges:replace', edges => this.replace(edges));
    bus.on('nodes:removed', ids => this.removeForNodes(ids));
  }

  normalize(edge = {}) {
    return {
      id: edge.id || `edge-${crypto.randomUUID().slice(0, 8)}`,
      from: edge.from,
      to: edge.to,
      label: String(edge.label || '').slice(0, 100),
      style: edge.style || 'solid',
      color: edge.color || '#94a3b8'
    };
  }

  list() { return [...this.edges.values()].map(edge => ({ ...edge })); }
  add(edge) {
    const normalized = this.normalize(edge);
    if (!normalized.from || !normalized.to) throw new Error('A conexão precisa de origem e destino.');
    this.edges.set(normalized.id, normalized);
    this.changed();
    return normalized;
  }
  remove(ids = []) {
    (Array.isArray(ids) ? ids : [ids]).forEach(id => this.edges.delete(id));
    this.changed();
  }
  removeForNodes(ids) {
    const set = new Set(ids);
    [...this.edges].forEach(([id, edge]) => { if (set.has(edge.from) || set.has(edge.to)) this.edges.delete(id); });
    this.changed();
  }
  replace(edges = []) {
    this.edges.clear();
    edges.map(edge => this.normalize(edge)).forEach(edge => this.edges.set(edge.id, edge));
    this.changed();
    return this.list();
  }
  changed() {
    this.bus.emit('edges:changed', this.list());
    this.bus.emit('document:changed');
  }
}

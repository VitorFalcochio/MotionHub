const NODE_TYPES = new Set(['title', 'text', 'box', 'group', 'image', 'code', 'api', 'database', 'server', 'person', 'company', 'document', 'process', 'decision', 'list', 'table', 'step', 'goal', 'milestone']);

export class NodeManager {
  constructor(bus) {
    this.bus = bus;
    this.nodes = new Map();
    bus.handle('nodes:list', () => this.list());
    bus.handle('nodes:get', id => this.nodes.get(id) || null);
    bus.handle('nodes:add', node => this.add(node));
    bus.handle('nodes:update', payload => this.update(payload));
    bus.handle('nodes:remove', ids => this.remove(ids));
    bus.handle('nodes:replace', nodes => this.replace(nodes));
    bus.handle('nodes:group', ids => this.group(ids));
    bus.handle('nodes:ungroup', ids => this.ungroup(ids));
  }

  normalize(node = {}) {
    const type = NODE_TYPES.has(node.type) ? node.type : 'box';
    return {
      id: node.id || `node-${crypto.randomUUID().slice(0, 8)}`,
      type,
      title: String(node.title || node.label || 'Novo bloco').slice(0, 120),
      content: String(node.content || '').slice(0, 1200),
      x: Number(node.x) || 0,
      y: Number(node.y) || 0,
      width: Math.max(140, Number(node.width) || (type === 'title' ? 280 : 210)),
      height: Math.max(64, Number(node.height) || (type === 'title' ? 76 : 104)),
      color: node.color || '#ffffff',
      accent: node.accent || '#2563eb',
      groupId: node.groupId || null,
      meta: node.meta && typeof node.meta === 'object' ? node.meta : {}
    };
  }

  list() { return [...this.nodes.values()].map(node => ({ ...node, meta: { ...node.meta } })); }

  add(node) {
    const normalized = this.normalize(node);
    this.nodes.set(normalized.id, normalized);
    this.changed('add', [normalized.id]);
    return normalized;
  }

  update({ id, patch = {} } = {}) {
    const current = this.nodes.get(id);
    if (!current) return null;
    const next = this.normalize({ ...current, ...patch, id });
    this.nodes.set(id, next);
    this.changed('update', [id]);
    return next;
  }

  remove(ids = []) {
    const removed = [];
    (Array.isArray(ids) ? ids : [ids]).forEach(id => {
      if (this.nodes.delete(id)) removed.push(id);
    });
    if (removed.length) {
      this.bus.emit('nodes:removed', removed);
      this.changed('remove', removed);
    }
    return removed;
  }

  replace(nodes = []) {
    this.nodes.clear();
    nodes.map(node => this.normalize(node)).forEach(node => this.nodes.set(node.id, node));
    this.changed('replace', [...this.nodes.keys()]);
    return this.list();
  }

  group(ids = []) {
    if (ids.length < 2) return null;
    const groupId = `group-${crypto.randomUUID().slice(0, 8)}`;
    ids.forEach(id => {
      const node = this.nodes.get(id);
      if (node) node.groupId = groupId;
    });
    this.changed('group', ids);
    return groupId;
  }

  ungroup(ids = []) {
    ids.forEach(id => {
      const node = this.nodes.get(id);
      if (node) node.groupId = null;
    });
    this.changed('ungroup', ids);
  }

  changed(reason, ids) {
    this.bus.emit('nodes:changed', { reason, ids, nodes: this.list() });
    this.bus.emit('document:changed');
  }
}

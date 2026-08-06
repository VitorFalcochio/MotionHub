export class LayoutEngine {
  constructor(bus) {
    this.bus = bus;
    bus.handle('layout:calculate', payload => this.calculate(payload));
  }

  calculate({ nodes = [], edges = [], type = 'flowchart' } = {}) {
    const next = nodes.map(node => ({ ...node }));
    if (!next.length) return next;
    if (type === 'mindmap') this.mindmap(next, edges);
    else if (type === 'roadmap') this.roadmap(next);
    else if (type === 'architecture' || type === 'tree') this.layers(next, edges);
    else if (type === 'grid') this.grid(next);
    else this.flow(next);
    return next;
  }

  flow(nodes) {
    nodes.forEach((node, index) => {
      node.x = index * 300;
      node.y = index % 2 ? 150 : 0;
    });
  }

  mindmap(nodes) {
    nodes[0].x = 0;
    nodes[0].y = 0;
    const branches = nodes.slice(1);
    branches.forEach((node, index) => {
      const angle = index / Math.max(branches.length, 1) * Math.PI * 2;
      const radius = branches.length > 8 ? 440 : 340;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius * 0.68;
    });
  }

  roadmap(nodes) {
    nodes.forEach((node, index) => {
      node.x = index * 270;
      node.y = index % 2 ? 80 : -80;
    });
  }

  layers(nodes, edges) {
    const incoming = new Map(nodes.map(node => [node.id, 0]));
    edges.forEach(edge => incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1));
    const roots = nodes.filter(node => !incoming.get(node.id));
    const levels = new Map(roots.map(node => [node.id, 0]));
    for (let pass = 0; pass < nodes.length; pass += 1) {
      edges.forEach(edge => {
        if (levels.has(edge.from)) levels.set(edge.to, Math.max(levels.get(edge.to) || 0, levels.get(edge.from) + 1));
      });
    }
    const rows = new Map();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!rows.has(level)) rows.set(level, []);
      rows.get(level).push(node);
    });
    rows.forEach((row, level) => row.forEach((node, index) => {
      node.x = (index - (row.length - 1) / 2) * 290;
      node.y = level * 190;
    }));
  }

  grid(nodes) {
    const columns = Math.ceil(Math.sqrt(nodes.length));
    nodes.forEach((node, index) => {
      node.x = (index % columns) * 270;
      node.y = Math.floor(index / columns) * 160;
    });
  }
}

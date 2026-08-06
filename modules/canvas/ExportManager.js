export class ExportManager {
  constructor(bus) {
    this.bus = bus;
    bus.handle('export:document', format => this.export(format));
  }

  async export(format = 'json') {
    const document = this.bus.request('document:get');
    if (format === 'png') return this.png(document.title);
    if (format === 'svg') return this.download(this.svg(document), `${this.slug(document.title)}.svg`, 'image/svg+xml');
    if (format === 'markdown') return this.download(this.markdown(document), `${this.slug(document.title)}.md`, 'text/markdown');
    if (format === 'pdf') return this.pdf(document);
    return this.download(JSON.stringify(document, null, 2), `${this.slug(document.title)}.json`, 'application/json');
  }

  png(title) {
    const stage = this.bus.request('engine:stage');
    const data = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${this.slug(title)}.png`;
    link.href = data;
    link.click();
  }

  svg(document) {
    const nodes = document.nodes;
    if (!nodes.length) return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>';
    const minX = Math.min(...nodes.map(node => node.x)) - 60;
    const minY = Math.min(...nodes.map(node => node.y)) - 60;
    const maxX = Math.max(...nodes.map(node => node.x + node.width)) + 60;
    const maxY = Math.max(...nodes.map(node => node.y + node.height)) + 60;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const edges = document.connections.map(edge => {
      const from = byId.get(edge.from), to = byId.get(edge.to);
      if (!from || !to) return '';
      const x1 = from.x + from.width, y1 = from.y + from.height / 2, x2 = to.x, y2 = to.y + to.height / 2;
      return `<path d="M${x1} ${y1} C${x1 + 70} ${y1},${x2 - 70} ${y2},${x2} ${y2}" fill="none" stroke="${edge.color}" stroke-width="2"/>`;
    }).join('');
    const blocks = nodes.map(node => `<g><rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="8" fill="${node.color}" stroke="#dfe3e8"/><rect x="${node.x + 10}" y="${node.y + 10}" width="3" height="${node.height - 20}" rx="2" fill="${node.accent}"/><text x="${node.x + 22}" y="${node.y + 29}" font-family="Inter,Arial" font-size="10" font-weight="700" fill="${node.accent}">${this.escape(node.type.toUpperCase())}</text><text x="${node.x + 22}" y="${node.y + 52}" font-family="Inter,Arial" font-size="15" font-weight="700" fill="#16181d">${this.escape(node.title)}</text><text x="${node.x + 22}" y="${node.y + 72}" font-family="Inter,Arial" font-size="10" fill="#69717f">${this.escape(node.content.slice(0, 70))}</text></g>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}"><rect x="${minX}" y="${minY}" width="100%" height="100%" fill="#f7f8fa"/>${edges}${blocks}</svg>`;
  }

  markdown(document) {
    const byFrom = new Map();
    document.connections.forEach(edge => {
      if (!byFrom.has(edge.from)) byFrom.set(edge.from, []);
      byFrom.get(edge.from).push(edge.to);
    });
    const byId = new Map(document.nodes.map(node => [node.id, node]));
    const incoming = new Set(document.connections.map(edge => edge.to));
    const roots = document.nodes.filter(node => !incoming.has(node.id));
    const lines = [`# ${document.title}`, ''];
    const walk = (node, depth, visited = new Set()) => {
      if (!node || visited.has(node.id)) return;
      visited.add(node.id);
      lines.push(`${'  '.repeat(depth)}- **${node.title}**${node.content ? `: ${node.content}` : ''}`);
      (byFrom.get(node.id) || []).forEach(id => walk(byId.get(id), depth + 1, visited));
    };
    roots.forEach(root => walk(root, 0));
    return lines.join('\n');
  }

  async pdf(document) {
    const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@4.2.1/+esm');
    const stage = this.bus.request('engine:stage');
    const image = stage.toDataURL({ pixelRatio: 2 });
    const pdf = new jsPDF({ orientation: stage.width() >= stage.height() ? 'landscape' : 'portrait', unit: 'px', format: [stage.width(), stage.height()] });
    pdf.addImage(image, 'PNG', 0, 0, stage.width(), stage.height());
    pdf.save(`${this.slug(document.title)}.pdf`);
  }

  download(content, name, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  slug(value) { return String(value || 'motion-canvas').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  escape(value) { return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]); }
}

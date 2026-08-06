export class ImportManager {
  constructor(bus) {
    this.bus = bus;
    bus.handle('import:file', file => this.file(file));
    bus.handle('import:text', payload => this.text(payload));
  }

  async file(file) {
    const content = await file.text();
    const extension = file.name.split('.').pop().toLowerCase();
    return this.text({ content, format: extension === 'json' ? 'json' : extension === 'md' ? 'markdown' : 'text' });
  }

  text({ content = '', format = 'text' } = {}) {
    if (format === 'json') {
      const parsed = JSON.parse(content);
      return this.bus.request('command:execute', { action: 'generate', input: parsed, label: 'Importar JSON' });
    }
    const lines = content.split(/\r?\n/).map(line => line.replace(/^\s*[-*#]+\s*/, '').trim()).filter(Boolean).slice(0, 300);
    const title = lines.shift() || 'Documento importado';
    const nodes = [{ id: 'root', type: 'title', title }];
    const connections = [];
    lines.forEach((line, index) => {
      nodes.push({ id: `import-${index}`, type: 'box', title: line.slice(0, 100), content: format === 'markdown' ? 'Importado do Markdown' : 'Importado do texto' });
      connections.push({ from: 'root', to: `import-${index}` });
    });
    return this.bus.request('command:execute', { action: 'generate', input: { type: 'mindmap', title, nodes, connections }, label: 'Importar conteúdo' });
  }
}

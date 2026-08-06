const TYPES = ['title', 'text', 'box', 'group', 'image', 'code', 'api', 'database', 'server', 'person', 'company', 'document', 'process', 'decision', 'list', 'table', 'step', 'goal', 'milestone'];
const COLORS = ['#2563eb', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#64748b'];

export class Inspector {
  constructor(bus, root) {
    this.bus = bus;
    this.root = root;
    this.renderEmpty();
    bus.on('selection:changed', ({ nodes }) => this.render(nodes));
    bus.on('node:edit-request', id => this.render([bus.request('nodes:get', id)], true));
  }

  renderEmpty() {
    this.root.innerHTML = `<div class="canvas-inspector-empty"><i class='bx bx-pointer'></i><strong>Nada selecionado</strong><span>Selecione um bloco para editar.</span></div>`;
  }

  render(nodes, focusTitle = false) {
    if (!nodes.length) return this.renderEmpty();
    if (nodes.length > 1) {
      this.root.innerHTML = `<div class="canvas-multi-selection"><strong>${nodes.length} blocos</strong><span>Edição múltipla ativa</span><div><button data-multi="align-y">Alinhar horizontal</button><button data-multi="align-x">Alinhar vertical</button><button data-multi="group">Agrupar</button></div></div>`;
      this.root.querySelector('[data-multi="align-y"]').onclick = () => this.bus.request('command:execute', { action: 'align', axis: 'y', label: 'Alinhar blocos' });
      this.root.querySelector('[data-multi="align-x"]').onclick = () => this.bus.request('command:execute', { action: 'align', axis: 'x', label: 'Alinhar blocos' });
      this.root.querySelector('[data-multi="group"]').onclick = () => this.bus.request('command:execute', { action: 'group', label: 'Agrupar blocos' });
      return;
    }
    const node = nodes[0];
    this.root.innerHTML = `
      <div class="canvas-inspector-id"><span>${node.type}</span><small>${node.id}</small></div>
      <label class="canvas-field">Título<input id="canvasInspectorTitle" value="${this.attr(node.title)}"></label>
      <label class="canvas-field">Descrição<textarea rows="4">${this.text(node.content)}</textarea></label>
      <label class="canvas-field">Tipo<select>${TYPES.map(type => `<option ${type === node.type ? 'selected' : ''}>${type}</option>`).join('')}</select></label>
      <div class="canvas-field"><span>Cor</span><div class="canvas-color-grid">${COLORS.map(color => `<button type="button" data-color="${color}" style="--swatch:${color}" class="${color === node.accent ? 'active' : ''}" aria-label="Cor ${color}"></button>`).join('')}</div></div>
      <div class="canvas-size-grid"><label>Largura<input type="number" data-size="width" value="${Math.round(node.width)}"></label><label>Altura<input type="number" data-size="height" value="${Math.round(node.height)}"></label></div>`;
    const update = patch => this.bus.request('command:execute', { action: 'updateNode', id: node.id, patch, label: 'Editar bloco' });
    this.root.querySelector('input').addEventListener('change', event => update({ title: event.target.value }));
    this.root.querySelector('textarea').addEventListener('change', event => update({ content: event.target.value }));
    this.root.querySelector('select').addEventListener('change', event => update({ type: event.target.value }));
    this.root.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => update({ accent: button.dataset.color })));
    this.root.querySelectorAll('[data-size]').forEach(input => input.addEventListener('change', () => update({ [input.dataset.size]: Number(input.value) })));
    if (focusTitle) setTimeout(() => this.root.querySelector('#canvasInspectorTitle')?.select(), 0);
  }

  attr(value) { return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  text(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}

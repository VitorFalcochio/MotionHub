const NODE_TOOLS = [
  ['box', 'bx-square-rounded', 'Bloco'], ['text', 'bx-text', 'Texto'], ['process', 'bx-git-branch', 'Processo'],
  ['decision', 'bx-diamond', 'Decisão'], ['api', 'bx-code-curly', 'API'], ['database', 'bx-data', 'Banco']
];

export class Toolbar {
  constructor(bus, root) {
    this.bus = bus;
    this.root = root;
    this.render();
    bus.on('history:changed', state => this.updateHistory(state));
    bus.on('selection:changed', ({ ids }) => root.classList.toggle('has-selection', ids.length > 0));
  }

  render() {
    this.root.innerHTML = `
      <div class="canvas-tool-group">
        <button type="button" data-action="select" class="active" title="Selecionar" aria-label="Selecionar"><i class='bx bx-pointer'></i></button>
        <button type="button" data-action="pan" title="Mover Canvas" aria-label="Mover Canvas"><i class='bx bx-hand'></i></button>
      </div>
      <span></span>
      <div class="canvas-tool-group">
        ${NODE_TOOLS.map(([type, icon, label]) => `<button type="button" data-node="${type}" title="Adicionar ${label}" aria-label="Adicionar ${label}"><i class='bx ${icon}'></i></button>`).join('')}
      </div>
      <span></span>
      <div class="canvas-tool-group canvas-selection-tools">
        <button type="button" data-action="duplicate" title="Duplicar" aria-label="Duplicar"><i class='bx bx-copy'></i></button>
        <button type="button" data-action="group" title="Agrupar" aria-label="Agrupar"><i class='bx bx-category'></i></button>
        <button type="button" data-action="delete" title="Excluir" aria-label="Excluir"><i class='bx bx-trash'></i></button>
      </div>`;
    this.root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.node) return this.bus.request('command:execute', { action: 'addNode', node: { type: button.dataset.node, title: `Novo ${button.title.replace('Adicionar ', '').toLowerCase()}` }, label: 'Adicionar bloco' });
      const action = button.dataset.action;
      if (action === 'pan' || action === 'select') {
        this.root.querySelectorAll('[data-action="pan"],[data-action="select"]').forEach(item => item.classList.toggle('active', item === button));
        this.bus.request('engine:stage').draggable(action === 'pan');
        return;
      }
      this.bus.request('command:execute', { action, label: button.title });
    });
  }

  updateHistory(state) {
    this.root.closest('.canvas-shell')?.querySelector('[data-command="undo"]')?.toggleAttribute('disabled', !state.canUndo);
    this.root.closest('.canvas-shell')?.querySelector('[data-command="redo"]')?.toggleAttribute('disabled', !state.canRedo);
  }
}

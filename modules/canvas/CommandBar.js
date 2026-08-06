export class CommandBar {
  constructor(bus, form) {
    this.bus = bus;
    this.form = form;
    this.input = form.querySelector('textarea');
    this.status = form.parentElement.querySelector('[data-canvas-status]');
    form.addEventListener('submit', event => { event.preventDefault(); this.submit(); });
    this.input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.submit(); }
    });
    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = `${Math.min(this.input.scrollHeight, 110)}px`;
    });
  }

  submit() {
    const input = this.input.value.trim();
    if (!input) return this.input.focus();
    try {
      this.status.textContent = 'Jarvis está estruturando o Canvas...';
      const action = /^(adicione|adicionar|inclua|incluir|acrescente)/i.test(input) ? 'generate' : 'generate';
      this.bus.request('command:execute', { action, input, label: 'Gerar com Jarvis' });
      this.input.value = '';
      this.input.style.height = 'auto';
      this.status.textContent = 'Estrutura criada e totalmente editável';
      this.bus.emit('canvas:notice', 'Canvas atualizado');
    } catch (error) {
      this.status.textContent = error.message;
      this.bus.emit('canvas:error', error.message);
    }
  }

  setValue(value) { this.input.value = value; this.input.focus(); }
}

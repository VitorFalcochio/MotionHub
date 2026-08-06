export class MiniMap {
  constructor(bus, root) {
    this.bus = bus;
    this.root = root;
    this.nodes = [];
    this.viewport = null;
    bus.on('nodes:changed', ({ nodes }) => { this.nodes = nodes; this.render(); });
    bus.on('viewport:changed', viewport => { this.viewport = viewport; this.render(); });
    bus.on('settings:changed', settings => root.classList.toggle('hidden', !settings.minimap));
  }

  render() {
    if (!this.nodes.length) { this.root.innerHTML = '<span>Canvas vazio</span>'; return; }
    const minX = Math.min(...this.nodes.map(node => node.x));
    const minY = Math.min(...this.nodes.map(node => node.y));
    const maxX = Math.max(...this.nodes.map(node => node.x + node.width));
    const maxY = Math.max(...this.nodes.map(node => node.y + node.height));
    const width = Math.max(maxX - minX, 1), height = Math.max(maxY - minY, 1);
    this.root.innerHTML = `<div class="canvas-minimap-world">${this.nodes.slice(0, 1000).map(node => `<i style="left:${(node.x - minX) / width * 100}%;top:${(node.y - minY) / height * 100}%;width:${Math.max(3, node.width / width * 100)}%;height:${Math.max(3, node.height / height * 100)}%;background:${node.accent}"></i>`).join('')}<b></b></div>`;
    if (this.viewport) {
      const worldLeft = -this.viewport.x / this.viewport.scale;
      const worldTop = -this.viewport.y / this.viewport.scale;
      const box = this.root.querySelector('b');
      box.style.left = `${(worldLeft - minX) / width * 100}%`;
      box.style.top = `${(worldTop - minY) / height * 100}%`;
      box.style.width = `${this.viewport.width / this.viewport.scale / width * 100}%`;
      box.style.height = `${this.viewport.height / this.viewport.scale / height * 100}%`;
    }
  }
}

export class CanvasSettings {
  constructor(bus) {
    this.bus = bus;
    this.state = { grid: true, snap: true, minimap: true };
    bus.handle('settings:get', () => ({ ...this.state }));
    bus.handle('settings:update', patch => this.update(patch));
  }
  update(patch = {}) {
    this.state = { ...this.state, ...patch };
    this.bus.emit('settings:changed', { ...this.state });
    return this.state;
  }
}

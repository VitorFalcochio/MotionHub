const STORAGE_KEY = 'motion_canvas_document_v1';

export class PersistenceManager {
  constructor(bus) {
    this.bus = bus;
    this.timer = null;
    bus.handle('persistence:load', () => this.load());
    bus.handle('persistence:save', document => this.save(document));
    bus.on('document:changed', () => this.schedule());
  }

  load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
  }

  save(document) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...document, savedAt: new Date().toISOString() }));
    this.bus.emit('persistence:saved');
  }

  schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.save(this.bus.request('document:get')), 320);
  }
}

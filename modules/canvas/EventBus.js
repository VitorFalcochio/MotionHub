export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.handlers = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach(callback => callback(payload));
  }

  handle(event, callback) {
    this.handlers.set(event, callback);
    return () => this.handlers.delete(event);
  }

  request(event, payload) {
    const handler = this.handlers.get(event);
    if (!handler) throw new Error(`Handler ausente: ${event}`);
    return handler(payload);
  }
}

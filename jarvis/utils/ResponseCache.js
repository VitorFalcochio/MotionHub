export class ResponseCache {
  constructor({ max = 50, ttl = 300000 } = {}) {
    this.max = max;
    this.ttl = ttl;
    this.items = new Map();
  }

  get(key) {
    const item = this.items.get(key);
    if (!item || Date.now() - item.at > this.ttl) {
      this.items.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    if (this.items.size >= this.max) this.items.delete(this.items.keys().next().value);
    this.items.set(key, { value, at: Date.now() });
  }
}

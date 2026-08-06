export class Storage {
  constructor(key, { limit = 80, ttlDays = 90 } = {}) {
    this.key = key;
    this.limit = limit;
    this.ttlMs = ttlDays * 86400000;
  }

  read(fallback = []) {
    try {
      const value = JSON.parse(localStorage.getItem(this.key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  write(value) {
    try { localStorage.setItem(this.key, JSON.stringify(value)); } catch {}
    return value;
  }

  clean(items) {
    const cutoff = Date.now() - this.ttlMs;
    return items.filter(item => !item.at || new Date(item.at).getTime() >= cutoff).slice(-this.limit);
  }
}

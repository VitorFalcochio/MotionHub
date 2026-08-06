import { Storage } from '../utils/Storage.js';

export class HistoryManager {
  constructor() {
    this.storage = new Storage('motion_jarvis_history_v2', { limit: 100, ttlDays: 60 });
  }

  add(entry) {
    const compact = {
      ...entry,
      user: String(entry.user || '').slice(0, 1000),
      response: String(entry.response || '').slice(0, 3000)
    };
    const history = this.storage.clean([...this.storage.read([]), { ...compact, id: compact.id || crypto.randomUUID(), at: new Date().toISOString() }]);
    this.storage.write(history);
    return history.at(-1);
  }

  complete(entry) { return this.add({ status: 'completed', ...entry }); }

  fail(entry) { return this.add({ status: 'failed', ...entry }); }

  list() { return this.storage.clean(this.storage.read([])); }
  clear() { localStorage.removeItem(this.storage.key); }
}

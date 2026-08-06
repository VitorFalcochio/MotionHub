export class HistoryManager {
  constructor(bus, limit = 80) {
    this.bus = bus;
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    bus.handle('history:push', entry => this.push(entry));
    bus.handle('history:undo', () => this.undo());
    bus.handle('history:redo', () => this.redo());
    bus.handle('history:state', () => this.state());
  }

  push(entry) {
    this.undoStack.push(entry);
    this.undoStack = this.undoStack.slice(-this.limit);
    this.redoStack = [];
    this.changed();
  }

  undo() {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    this.redoStack.push(entry);
    this.bus.request('document:restore', entry.before);
    this.changed();
    return true;
  }

  redo() {
    const entry = this.redoStack.pop();
    if (!entry) return false;
    this.undoStack.push(entry);
    this.bus.request('document:restore', entry.after);
    this.changed();
    return true;
  }

  state() { return { canUndo: this.undoStack.length > 0, canRedo: this.redoStack.length > 0 }; }
  changed() { this.bus.emit('history:changed', this.state()); }
}

const KEY = 'motion_jarvis_context_v3';
const LEGACY_KEY = 'motion_jarvis_context_v2';
const TOPIC_PATTERNS = [
  /(?:criar|montar|construir|projeto de|quero um[a]?)\s+(.{3,60})/i,
  /(?:sobre|para|do projeto)\s+(.{3,60})/i
];

export class ContextEngine {
  constructor() {
    this.state = this.load();
  }

  load() {
    const empty = { topic: '', project: '', mode: 'general', turns: [], references: {} };
    try {
      const current = JSON.parse(sessionStorage.getItem(KEY));
      if (current) return { ...empty, ...current };
      const legacy = JSON.parse(sessionStorage.getItem(LEGACY_KEY));
      return legacy ? { ...empty, ...legacy } : empty;
    } catch { return empty; }
  }

  resolve(input, intent, runtime = {}) {
    const change = input.text.match(/(?:agora (?:vamos )?(?:falar|trabalhar)|mude (?:o assunto )?para)\s+(?:sobre\s+)?(.{3,80})/i)?.[1];
    const explicit = change || TOPIC_PATTERNS.map(pattern => input.text.match(pattern)?.[1]).find(Boolean);
    const ignoredTopics = /^(uma )?(tarefa|despesa|receita|mapa mental|roadmap)$/i;
    if (explicit && !ignoredTopics.test(explicit.trim())) this.state.topic = explicit.replace(/[.!?]+$/, '').trim();
    const projectNames = runtime.workspace?.projects || [];
    const project = projectNames.find(name => input.comparison.includes(this.compare(name)));
    if (project) this.state.project = project;
    const contextual = /^(adicione|inclua|agora|depois|e |tambem|continue|melhore|remova)/i.test(input.comparison);
    const selection = runtime.workspace?.selection;
    if (selection) this.state.references.selection = selection;
    const result = {
      activeTopic: this.state.topic || '',
      activeProject: this.state.project || '',
      mode: this.state.mode || 'general',
      contextual,
      enrichedText: contextual && this.state.topic ? `${input.text} (contexto: ${this.state.topic})` : input.text,
      previousTurns: this.state.turns.slice(-4),
      references: { ...this.state.references },
      changedTopic: Boolean(change)
    };
    this.state.turns.push({ role: 'user', text: input.text, intent: intent.name, at: new Date().toISOString() });
    this.state.turns = this.state.turns.slice(-12);
    this.save();
    return result;
  }

  compare(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

  setMode(mode) {
    this.state.mode = mode || 'general';
    this.save();
  }

  save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
  }

  recordAssistant(response, source) {
    this.state.turns.push({ role: 'assistant', text: response.slice(0, 500), source, at: new Date().toISOString() });
    this.state.turns = this.state.turns.slice(-12);
    this.save();
  }

  clear() {
    this.state = { topic: '', project: '', mode: 'general', turns: [], references: {} };
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(LEGACY_KEY);
  }
}

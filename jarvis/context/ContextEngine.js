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
    const empty = { topic: '', project: '', mode: 'general', turns: [], references: {}, interaction: this.emptyInteraction() };
    try {
      const current = JSON.parse(sessionStorage.getItem(KEY));
      if (current) return { ...empty, ...current, interaction: { ...empty.interaction, ...(current.interaction || {}) } };
      const legacy = JSON.parse(sessionStorage.getItem(LEGACY_KEY));
      return legacy ? { ...empty, ...legacy } : empty;
    } catch { return empty; }
  }

  resolve(input, intent, runtime = {}) {
    this.state.interaction.choiceOffered = false;
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
      changedTopic: Boolean(change),
      interaction: { ...this.state.interaction }
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

  setConversationPolicy(policy) {
    this.state.interaction.currentPolicy = { ...policy };
    this.save();
  }

  markChoiceOffered() {
    this.state.interaction.choiceOffered = true;
    this.state.interaction.lastStrategy = 'choose';
    this.state.interaction.choiceCooldown = Math.max(1, Number(this.state.interaction.choiceCooldown || 0));
    this.save();
  }

  markChoiceSelected(selection = '') {
    this.state.interaction.mustDeliver = true;
    this.state.interaction.choiceOffered = false;
    this.state.interaction.choiceCooldown = 2;
    const selectedValue = typeof selection === 'object'
      ? selection.prompt || selection.label || ''
      : selection;
    this.state.interaction.selectedChoice = String(selectedValue).slice(0, 160);
    this.save();
  }

  getInteraction() { return { ...this.state.interaction }; }

  emptyInteraction() {
    return { mustDeliver: false, choiceCooldown: 0, choiceOffered: false, selectedChoice: '', lastStrategy: '', currentPolicy: null };
  }

  save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
  }

  recordAssistant(response, source, experience = {}) {
    const strategy = experience.strategy || 'answer';
    this.state.turns.push({ role: 'assistant', text: response.slice(0, 500), source, strategy, at: new Date().toISOString() });
    this.state.turns = this.state.turns.slice(-12);
    this.state.interaction.lastStrategy = strategy;
    if (strategy !== 'choose') {
      if (this.state.interaction.mustDeliver) this.state.interaction.mustDeliver = false;
      this.state.interaction.choiceCooldown = Math.max(0, Number(this.state.interaction.choiceCooldown || 0) - 1);
    }
    this.save();
  }

  clear() {
    this.state = { topic: '', project: '', mode: 'general', turns: [], references: {}, interaction: this.emptyInteraction() };
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(LEGACY_KEY);
  }
}

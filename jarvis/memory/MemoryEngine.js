import { Storage } from '../utils/Storage.js';

export class MemoryEngine {
  constructor() {
    this.storage = new Storage('motion_jarvis_memory_v2', { limit: 60, ttlDays: 120 });
    this.memory = this.storage.read({ conversations: [], projects: [], technologies: [], preferences: [], goals: [], openFiles: [] });
  }

  recall(input, context, runtime = {}) {
    const workspace = runtime.workspace || {};
    this.memory.projects = this.unique([...(workspace.projects || []), ...this.memory.projects], 12);
    this.memory.goals = this.unique([...(workspace.goals || []), ...this.memory.goals], 12);
    this.memory.openFiles = this.unique([...(workspace.openFiles || []), ...this.memory.openFiles], 10);
    const knownTech = ['javascript', 'typescript', 'react', 'node', 'docker', 'jwt', 'redis', 'postgres', 'postgresql', 'mongodb', 'python'];
    this.memory.technologies = this.unique([
      ...input.tokens.filter(token => knownTech.includes(token)),
      ...this.memory.technologies
    ], 16);
    const preference = input.text.match(/(?:eu prefiro|prefiro|sempre use|minha prefer[eê]ncia [eé])\s+(.{3,100})/i)?.[1];
    if (preference) this.memory.preferences = this.unique([preference.replace(/[.!?]+$/, '').trim(), ...this.memory.preferences], 12);
    this.memory.conversations = this.storage.clean([
      ...this.memory.conversations,
      { text: input.text.slice(0, 300), topic: context.activeTopic, at: new Date().toISOString() }
    ]);
    this.storage.write(this.memory);
    return {
      recentProjects: this.memory.projects.slice(0, 5),
      technologies: this.memory.technologies.slice(0, 8),
      preferences: this.memory.preferences.slice(0, 8),
      goals: this.memory.goals.slice(0, 5),
      openFiles: this.memory.openFiles.slice(0, 5),
      recentConversations: this.memory.conversations.slice(-4),
      references: this.referencesFor(input, context)
    };
  }

  referencesFor(input, context) {
    const references = [];
    if (context.activeProject && this.memory.projects.includes(context.activeProject)) references.push({ type: 'project', value: context.activeProject });
    for (const technology of this.memory.technologies) {
      if (input.comparison.includes(technology)) references.push({ type: 'technology', value: technology });
    }
    return references.slice(0, 5);
  }

  inspect() { return structuredClone(this.memory); }

  forget({ type, value, all = false } = {}) {
    if (all) {
      this.memory = { conversations: [], projects: [], technologies: [], preferences: [], goals: [], openFiles: [] };
    } else if (Array.isArray(this.memory[type])) {
      this.memory[type] = value
        ? this.memory[type].filter(item => !this.memoryValue(item).includes(String(value).toLowerCase()))
        : [];
    } else if (value) {
      for (const key of Object.keys(this.memory)) {
        if (Array.isArray(this.memory[key])) this.memory[key] = this.memory[key].filter(item => !this.memoryValue(item).includes(String(value).toLowerCase()));
      }
    }
    this.storage.write(this.memory);
    return this.inspect();
  }

  memoryValue(item) {
    if (typeof item === 'string') return item.toLowerCase();
    return String(item?.text || item?.name || item?.title || '').toLowerCase();
  }

  unique(values, limit) {
    return [...new Set(values.filter(Boolean).map(value => typeof value === 'string' ? value : value.name || value.title).filter(Boolean))].slice(0, limit);
  }
}

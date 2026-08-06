import { SkillRegistry } from './SkillRegistry.js';

const INTENT_TO_SKILL = new Map([
  ['roadmap', 'roadmap'], ['canvas', 'canvas'], ['coding', 'coding'], ['debug', 'coding'], ['search', 'search'],
  ['database', 'database'], ['backend', 'backend'], ['frontend', 'frontend'],
  ['architecture', 'architecture'], ['study', 'study'], ['planner', 'planner'], ['system', 'system'], ['memory', 'memory']
]);

export class SkillEngine {
  constructor(registry = new SkillRegistry()) { this.registry = registry; }

  async execute(intent, payload) {
    const name = INTENT_TO_SKILL.get(intent.name);
    if (!name) return null;
    const skill = await this.registry.get(name);
    const result = await skill.execute(payload);
    return { ...result, skill: skill.descriptor.name, descriptor: skill.descriptor };
  }
}

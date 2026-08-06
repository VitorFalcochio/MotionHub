const LOADERS = {
  roadmap: () => import('./roadmap.skill.js'),
  canvas: () => import('./canvas.skill.js'),
  coding: () => import('./coding.skill.js'),
  database: () => import('./database.skill.js'),
  backend: () => import('./backend.skill.js'),
  frontend: () => import('./frontend.skill.js'),
  architecture: () => import('./architecture.skill.js'),
  study: () => import('./study.skill.js'),
  planner: () => import('./planner.skill.js'),
  system: () => import('./system.skill.js'),
  search: () => import('./search.skill.js'),
  memory: () => import('./memory.skill.js'),
  business: () => import('./business.skill.js')
};

const REQUIRED_DESCRIPTOR_FIELDS = ['name', 'description', 'whenToUse', 'input', 'output', 'priority'];

export class SkillRegistry {
  constructor() { this.cache = new Map(); }

  async get(name) {
    if (!LOADERS[name]) return null;
    if (!this.cache.has(name)) this.cache.set(name, LOADERS[name]());
    const skill = await this.cache.get(name);
    const missing = REQUIRED_DESCRIPTOR_FIELDS.filter(field => skill?.descriptor?.[field] === undefined);
    if (typeof skill?.execute !== 'function' || missing.length) throw new Error(`Skill inválida: ${name}${missing.length ? ` (${missing.join(', ')})` : ''}`);
    return skill;
  }

  names() { return Object.keys(LOADERS); }
}

import { ResponseCache } from '../utils/ResponseCache.js';

const SOURCES = ['backend', 'frontend', 'javascript', 'docker', 'jwt', 'redis', 'postgres', 'react', 'api'];

export class KnowledgeEngine {
  constructor() {
    this.cache = new ResponseCache({ max: SOURCES.length, ttl: 3600000 });
  }

  async load(id) {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const response = await fetch(new URL(`./${id}.json`, import.meta.url));
    if (!response.ok) throw new Error(`Knowledge source unavailable: ${id}`);
    const data = await response.json();
    this.cache.set(id, data);
    return data;
  }

  async lookup(input) {
    const candidates = SOURCES.filter(id => input.comparison.includes(id) || (id === 'postgres' && input.comparison.includes('sql')));
    if (!candidates.length && !/o que e|explique|como funciona|para que serve/.test(input.comparison)) return null;
    const entries = await Promise.all((candidates.length ? candidates : SOURCES).map(id => this.load(id)));
    const scored = entries.map(entry => ({
      entry,
      score: entry.keywords.reduce((score, keyword) => score + (input.comparison.includes(keyword) ? keyword.length : 0), 0)
    })).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    if (!scored.length) return null;
    const entry = scored[0].entry;
    return {
      id: entry.id,
      title: entry.title,
      response: `**${entry.title}**\n${entry.summary}\n\n**Boas práticas:**\n${entry.practices.map(item => `- ${item}`).join('\n')}`,
      confidence: Math.min(0.96, 0.65 + scored[0].score / 40)
    };
  }
}

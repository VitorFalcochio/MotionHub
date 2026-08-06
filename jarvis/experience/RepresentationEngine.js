const INTENT_REPRESENTATION = {
  canvas: 'mindmap', roadmap: 'roadmap', architecture: 'architecture',
  database: 'erd', coding: 'code', study: 'checklist', planner: 'checklist', search: 'document'
};

export class RepresentationEngine {
  select({ input, intent, result }) {
    if (result?.representation) return result.representation;
    if (/compare|diferenca|versus|\bvs\b/.test(input.comparison)) return { type: 'table', reason: 'comparação por critérios' };
    if (/fluxo|processo|decisao/.test(input.comparison)) return { type: 'flowchart', reason: 'sequência e decisões' };
    if (/timeline|cronograma|prazo/.test(input.comparison)) return { type: 'timeline', reason: 'dimensão temporal' };
    const type = INTENT_REPRESENTATION[intent.name] || 'text';
    return { type, reason: type === 'text' ? 'resposta direta' : `representação adequada à intenção ${intent.name}` };
  }
}

import { ActionPolicy } from './ActionPolicy.js';

export class SmartActionPlanner {
  constructor(policy = new ActionPolicy()) { this.policy = policy; }

  plan({ input, intent, result, representation, context, conversation = {} }) {
    const actions = [...(result?.actions || [])];
    if (result?.action) actions.push(result.action);

    const hasCanvas = actions.some(action => (action.type || action.kind) === 'canvas');
    const visual = new Set(['canvas', 'mindmap', 'flowchart', 'architecture', 'erd', 'roadmap', 'timeline']).has(representation.type);
    if (visual && !hasCanvas) {
      actions.push({
        id: 'open-canvas', type: 'canvas', label: 'Abrir no Canvas', icon: 'bx-vector',
        payload: { prompt: context.enrichedText || input.text }, priority: 80,
        autoExecute: intent.name === 'canvas'
      });
    }

    if (!conversation.mustDeliver && ['architecture', 'roadmap', 'study'].includes(intent.name)) {
      actions.push({
        id: 'detail-result', type: 'prompt', label: 'Detalhar próximos passos', icon: 'bx-list-check',
        payload: { prompt: `Detalhe os próximos passos para ${context.activeTopic || input.text}` }, priority: 35
      });
    }

    if (!conversation.mustDeliver && intent.name === 'knowledge') {
      actions.push({
        id: 'deepen-topic', type: 'prompt', label: 'Aprofundar', icon: 'bx-layer-plus',
        payload: { prompt: `Aprofunde ${context.activeTopic || input.text} com um exemplo prático` }, priority: 25
      });
    }

    if (!conversation.mustDeliver && ['coding', 'debug'].includes(intent.name)) {
      actions.push({
        id: 'structure-solution', type: 'prompt', label: 'Estruturar solução', icon: 'bx-code-block',
        payload: { prompt: `Estruture uma solução verificável para: ${context.enrichedText || input.text}` }, priority: 30
      });
    }

    return actions
      .filter((action, index, list) => index === list.findIndex(item => (item.id || item.type) === (action.id || action.type)))
      .map(action => this.policy.apply(action))
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
      .slice(0, 3);
  }
}

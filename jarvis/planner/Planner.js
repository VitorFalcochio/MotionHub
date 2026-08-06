import { RepresentationEngine } from '../experience/RepresentationEngine.js';
import { SmartActionPlanner } from '../actions/SmartActionPlanner.js';

export class Planner {
  constructor({ representation = new RepresentationEngine(), actions = new SmartActionPlanner() } = {}) {
    this.representation = representation;
    this.actions = actions;
  }

  plan({ input, intent, social, localResult, groqDecision, context, memory, knowledge, conversation }) {
    let result;
    if (social) {
      result = { response: social.response, source: 'social', needsGroq: false };
    } else if (groqDecision.useGroq) {
      result = {
        response: localResult?.response || 'Consigo tratar isso com o especialista Groq. Configure a chave nas opções do Jarvis para continuar.',
        source: localResult?.source || 'local',
        needsGroq: true,
        groqReason: groqDecision.reason,
        canvas: Boolean(localResult?.canvas),
        action: localResult?.action || null
      };
    } else if (localResult) {
      result = { ...localResult, needsGroq: false };
    } else if (knowledge) {
      result = { response: knowledge.response, source: 'knowledge', needsGroq: false };
    } else {
      result = {
        response: context.activeTopic
          ? `Ainda estamos falando de **${context.activeTopic}**. Diga se você quer planejar, implementar ou visualizar esse assunto.`
          : 'Entendi a mensagem, mas preciso de um pouco mais de contexto para agir localmente.',
        source: 'local', needsGroq: false, memoryUsed: memory.recentConversations.length > 1
      };
    }
    const representation = this.representation.select({ input, intent, result });
    const actions = this.actions.plan({ input, intent, result, representation, context, conversation });
    return { ...result, representation, actions, conversation, memoryReferences: memory.references || [] };
  }
}

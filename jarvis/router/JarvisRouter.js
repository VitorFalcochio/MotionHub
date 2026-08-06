import { InputNormalizer } from '../normalizer/InputNormalizer.js';
import { SocialEngine } from '../social/SocialEngine.js';
import { IntentEngine } from '../brain/IntentEngine.js';
import { ContextEngine } from '../context/ContextEngine.js';
import { MemoryEngine } from '../memory/MemoryEngine.js';
import { KnowledgeEngine } from '../knowledge/KnowledgeEngine.js';
import { SkillEngine } from '../skills/SkillEngine.js';
import { LocalBrain } from '../brain/LocalBrain.js';
import { Planner } from '../planner/Planner.js';
import { GroqPolicy } from '../groq/GroqPolicy.js';
import { HistoryManager } from '../history/HistoryManager.js';
import { ModeEngine } from '../experience/ModeEngine.js';
import { createJarvisResponse } from '../contracts/JarvisResponse.js';
import { abortIfNeeded } from '../utils/JarvisError.js';
import { ConversationPolicy } from '../experience/ConversationPolicy.js';
import { ResponseGuard } from '../experience/ResponseGuard.js';

const STAGE_LABELS = {
  normalize: 'Normalizando pedido', social: 'Interpretando conversa', intent: 'Identificando intenção',
  context: 'Recuperando contexto', memory: 'Consultando memória', knowledge: 'Consultando conhecimento',
  skill: 'Selecionando capacidade', plan: 'Planejando resposta', complete: 'Validando resultado'
};

export class JarvisRouter {
  constructor(dependencies = {}) {
    this.normalizer = dependencies.normalizer || new InputNormalizer();
    this.social = dependencies.social || new SocialEngine();
    this.intent = dependencies.intent || new IntentEngine();
    this.context = dependencies.context || new ContextEngine();
    this.memory = dependencies.memory || new MemoryEngine();
    this.knowledge = dependencies.knowledge || new KnowledgeEngine();
    this.skills = dependencies.skills || new SkillEngine();
    this.localBrain = dependencies.localBrain || new LocalBrain();
    this.planner = dependencies.planner || new Planner();
    this.groqPolicy = dependencies.groqPolicy || new GroqPolicy();
    this.history = dependencies.history || new HistoryManager();
    this.modes = dependencies.modes || new ModeEngine();
    this.conversation = dependencies.conversation || new ConversationPolicy();
    this.responseGuard = dependencies.responseGuard || new ResponseGuard();
  }

  async process(rawInput, runtime = {}) {
    const started = performance.now();
    const requestId = crypto.randomUUID();
    const trace = [];
    const stage = id => {
      abortIfNeeded(runtime.signal);
      const item = { id, label: STAGE_LABELS[id], at: Math.round((performance.now() - started) * 10) / 10 };
      trace.push(item);
      try { runtime.onProgress?.(item); } catch {}
    };

    try {
      stage('normalize');
      const input = this.normalizer.normalize(rawInput);
      stage('social');
      const social = this.social.match(input);
      stage('intent');
      const intent = this.intent.classify(input);
      stage('context');
      const context = this.context.resolve(input, intent, runtime);
      const mode = this.modes.infer(input, intent, context);
      this.context.setMode(mode.name);
      stage('memory');
      const memory = this.memory.recall(input, context, runtime);
      stage('knowledge');
      let knowledge = null;
      try { knowledge = await this.knowledge.lookup(input); }
      catch (error) { trace.push({ id: 'knowledge-warning', label: error.message, at: Math.round(performance.now() - started) }); }
      stage('skill');
      const effectiveRuntime = {
        ...runtime,
        mode,
        memory: { inspect: () => this.memory.inspect(), forget: criteria => this.memory.forget(criteria) }
      };
      const payload = { input, intent, context, mode, memory, knowledge, runtime: effectiveRuntime };
      const skill = await this.skills.execute(intent, payload);
      const localResult = await this.localBrain.reason({ ...payload, skill });
      const groqDecision = this.groqPolicy.evaluate({ input, intent, localResult });
      const conversation = this.conversation.decide({ input, intent, context, social, localResult, groqDecision });
      this.context.setConversationPolicy(conversation);
      stage('plan');
      const planned = this.planner.plan({ input, social, intent, context, mode, memory, knowledge, localResult, groqDecision, conversation });
      planned.specialistContext = {
        intent: intent.name,
        secondaryIntents: intent.secondary,
        mode: mode.name,
        topic: context.activeTopic,
        project: context.activeProject,
        enrichedText: context.enrichedText,
        memoryReferences: memory.references,
        groqReason: planned.groqReason || '',
        strategy: conversation.strategy,
        answerFirst: conversation.answerFirst,
        mustDeliver: conversation.mustDeliver,
        maxQuestions: conversation.maxQuestions,
        allowChoices: conversation.allowChoices,
        choiceReason: conversation.choiceReason
      };
      stage('complete');
      const responseTime = Math.round((performance.now() - started) * 10) / 10;
      const response = createJarvisResponse(planned, { requestId, intent, mode, context, trace, responseTime });
      if (!response.needsGroq) {
        this.context.recordAssistant(response.message, response.source, response);
        this.history.complete(this.historyEntry(input.text, response));
      }
      return response;
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      const responseTime = Math.round((performance.now() - started) * 10) / 10;
      const response = createJarvisResponse({
        response: 'Não consegui concluir o processamento. O restante do Motion Hub permaneceu intacto.',
        source: 'fallback', status: 'failed',
        error: { code: 'pipeline_failed', message: error.message, recoverable: true },
        actions: [{ type: 'prompt', label: 'Tentar novamente', icon: 'bx-refresh', payload: { prompt: String(rawInput) }, priority: 50 }]
      }, { requestId, trace, responseTime });
      this.history.fail(this.historyEntry(String(rawInput), response));
      return response;
    }
  }

  historyEntry(input, response) {
    return {
      id: response.requestId, user: input, response: response.message, source: response.source,
      intent: response.intent, mode: response.mode, strategy: response.strategy, responseTime: response.responseTime,
      needsGroq: response.needsGroq, representation: response.representation.type,
      actions: response.actions.map(action => action.type), error: response.error
    };
  }

  completeExternal(requestId, input, response, source = 'groq', metadata = {}) {
    const interaction = this.context.getInteraction();
    const strategy = interaction.choiceOffered ? 'choose' : metadata.strategy || interaction.currentPolicy?.strategy || 'answer';
    this.context.recordAssistant(response, source, { strategy });
    return this.history.complete({ id: requestId, user: input, response, source, intent: metadata.intent || 'specialist', mode: metadata.mode || 'general', strategy, responseTime: metadata.responseTime || 0, needsGroq: source === 'groq' });
  }

  recordGroq(input, response, startedAt = performance.now(), requestId = crypto.randomUUID()) {
    return this.completeExternal(requestId, input, response, 'groq', { responseTime: Math.round(performance.now() - startedAt) });
  }

  resetConversation() { this.context.clear(); }
  getHistory() { return this.history.list(); }
  getSkills() { return this.skills.registry.names(); }
  inspectMemory() { return this.memory.inspect(); }
  forgetMemory(criteria) { return this.memory.forget(criteria); }
  evaluateChoices(args) {
    const decision = this.conversation.validateChoices(args, this.context.getInteraction());
    if (decision.allowed) this.context.markChoiceOffered();
    return decision;
  }
  registerChoice(selection) { this.context.markChoiceSelected(selection); }
  validateResponse(content, conversation) { return this.responseGuard.validate(content, conversation); }
  responseRepairInstruction(validation, conversation) { return this.responseGuard.repairInstruction(validation, conversation); }
}

const SOURCES = new Set(['social', 'local', 'knowledge', 'skill', 'web', 'groq', 'fallback', 'system']);
const REPRESENTATIONS = new Set(['text', 'checklist', 'table', 'code', 'canvas', 'timeline', 'roadmap', 'mindmap', 'flowchart', 'architecture', 'erd', 'document', 'markdown']);

function normalizeAction(action, index) {
  const type = action?.type || action?.kind || 'prompt';
  return {
    id: action?.id || `${type}-${index + 1}`,
    type,
    label: action?.label || 'Continuar',
    icon: action?.icon || 'bx-right-arrow-alt',
    payload: action?.payload || (action?.prompt ? { prompt: action.prompt } : {}),
    priority: Number(action?.priority || 0),
    risk: action?.risk || 'low',
    requiresConfirmation: Boolean(action?.requiresConfirmation),
    autoExecute: Boolean(action?.autoExecute)
  };
}

export function createJarvisResponse(result = {}, context = {}) {
  const message = String(result.message || result.response || '').trim();
  const representationType = REPRESENTATIONS.has(result.representation?.type)
    ? result.representation.type
    : 'text';
  const actions = (result.actions || (result.action ? [result.action] : []))
    .map(normalizeAction)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
  const source = SOURCES.has(result.source) ? result.source : 'local';

  return {
    schemaVersion: 1,
    requestId: context.requestId || crypto.randomUUID(),
    message,
    response: message,
    source,
    status: result.needsGroq ? 'delegated' : (result.status || 'completed'),
    needsGroq: Boolean(result.needsGroq),
    groqReason: result.groqReason || '',
    intent: context.intent?.name || result.intent || 'general',
    secondaryIntents: context.intent?.secondary || [],
    mode: context.mode?.name || result.mode || 'general',
    strategy: result.conversation?.strategy || result.strategy || 'answer',
    conversation: result.conversation || { strategy: 'answer', answerFirst: true, mustDeliver: false, maxQuestions: 1, allowChoices: false },
    representation: { type: representationType, ...(result.representation || {}) },
    actions,
    action: actions.find(action => action.type === 'canvas') || actions[0] || null,
    assumptions: result.assumptions || [],
    memoryReferences: result.memoryReferences || [],
    context: context.context || result.context || {},
    trace: context.trace || [],
    responseTime: context.responseTime || 0,
    confidence: context.intent?.confidence ?? result.confidence ?? 0.5,
    specialistContext: result.specialistContext || null,
    error: result.error || null
  };
}

import { JarvisRouter } from './router/JarvisRouter.js';
import { OperationalPolicy } from './actions/OperationalPolicy.js';

const router = new JarvisRouter();
const operationalPolicy = new OperationalPolicy();

window.JarvisCognitive = {
  process: (message, runtime) => router.process(message, runtime),
  recordGroq: (input, response, startedAt) => router.recordGroq(input, response, startedAt),
  completeExternal: (requestId, input, response, source, metadata) => router.completeExternal(requestId, input, response, source, metadata),
  resetConversation: () => router.resetConversation(),
  getHistory: () => router.getHistory(),
  getSkills: () => router.getSkills(),
  inspectMemory: () => router.inspectMemory(),
  forgetMemory: criteria => router.forgetMemory(criteria),
  evaluateChoices: args => router.evaluateChoices(args),
  registerChoice: selection => router.registerChoice(selection),
  validateResponse: (content, conversation) => router.validateResponse(content, conversation),
  responseRepairInstruction: (validation, conversation) => router.responseRepairInstruction(validation, conversation),
  classifyOperation: name => operationalPolicy.classify(name),
  router
};

window.dispatchEvent(new CustomEvent('motion:jarvis-ready'));

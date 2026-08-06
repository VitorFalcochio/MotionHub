export const descriptor = {
  name: 'coding', description: 'Orienta implementação, depuração e refatoração.', whenToUse: ['código', 'programar', 'debug'], input: 'Problema técnico', output: 'Estratégia de implementação', priority: 72
};

export async function execute({ input, knowledge }) {
  if (knowledge) return { response: knowledge.response, source: 'knowledge' };
  return {
    response: `Para resolver **${input.text}**, preciso trabalhar em quatro passos:\n1. Definir o comportamento esperado e um caso reproduzível.\n2. Localizar a fronteira responsável no código.\n3. Implementar a menor mudança coerente com a arquitetura.\n4. Validar o fluxo principal, erros e regressões.\n\nEnvie o trecho de código, erro e resultado esperado para eu produzir uma solução específica.`,
    source: 'skill'
  };
}

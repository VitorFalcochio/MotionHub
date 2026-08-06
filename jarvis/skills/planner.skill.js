export const descriptor = {
  name: 'planner', description: 'Organiza prioridades e próximos passos.', whenToUse: ['planejar', 'priorizar', 'organizar'], input: 'Objetivo e restrições', output: 'Plano executável', priority: 66
};

export async function execute({ input, context, runtime }) {
  if (runtime.hub?.execute || runtime.localExecutor) {
    const local = runtime.hub?.execute
      ? await runtime.hub.execute({ type: 'legacy-command', text: input.text })
      : await runtime.localExecutor(input.text);
    if (local?.handled) return { response: local.response, source: 'local' };
  }
  const subject = context.activeTopic || input.text;
  if (/validacao|validar|hipotese|publico/.test(input.comparison)) {
    return {
      response: `**Plano de validação: ${subject}**\n\n1. **Hipóteses** — registre problema, público e proposta de valor em uma frase cada.\n2. **Recrutamento** — encontre cinco pessoas do público presumido, sem tentar vender a solução.\n3. **Entrevistas** — investigue frequência do problema, solução atual e custo de não resolver.\n4. **Teste** — apresente um protótipo simples da ação principal e observe o comportamento.\n5. **Decisão** — avance somente se pelo menos três pessoas relatarem o problema espontaneamente e demonstrarem intenção real de testar.\n\n**Primeira tarefa**\nEscrever a mensagem de convite e listar as cinco primeiras pessoas para conversar.`,
      source: 'skill', representation: { type: 'checklist', title: `Validação: ${subject}` }
    };
  }
  return {
    response: `**Plano inicial: ${subject}**\n1. Defina o resultado concreto que precisa existir.\n2. Separe até três entregas essenciais.\n3. Comece pela entrega com maior impacto ou risco.\n4. Revise o resultado antes de ampliar o escopo.`,
    source: 'skill', representation: { type: 'checklist', title: `Plano: ${subject}` }
  };
}

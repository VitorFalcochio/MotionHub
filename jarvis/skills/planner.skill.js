export const descriptor = {
  name: 'planner', description: 'Organiza prioridades e próximos passos.', whenToUse: ['planejar', 'priorizar', 'organizar'], input: 'Objetivo e restrições', output: 'Plano executável', priority: 66
};

export async function execute({ input, runtime }) {
  if (runtime.localExecutor) {
    const local = await runtime.localExecutor(input.text);
    if (local?.handled) return { response: local.response, source: 'local' };
  }
  return { response: '**Plano rápido**\n1. Defina o resultado que precisa existir hoje.\n2. Escolha até três entregas essenciais.\n3. Comece pela tarefa de maior impacto ou risco.\n4. Reserve um ponto de revisão ao final do período.', source: 'skill' };
}

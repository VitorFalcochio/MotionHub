export const descriptor = {
  name: 'system', description: 'Executa ações e consultas no Motion Hub.', whenToUse: ['projetos', 'tarefas', 'agenda', 'financeiro'], input: 'Comando do usuário', output: 'Resultado da ação', priority: 85
};

export async function execute({ input, runtime }) {
  const local = runtime.hub?.execute
    ? await runtime.hub.execute({ type: 'legacy-command', text: input.text })
    : await runtime.localExecutor?.(input.text);
  if (local?.handled) return { response: local.response, source: 'local' };
  return { response: 'Entendi que este é um comando do Motion Hub, mas não encontrei uma ação local segura para executá-lo. Diga qual item deseja consultar ou alterar.', source: 'skill' };
}

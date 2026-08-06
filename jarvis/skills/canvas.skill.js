export const descriptor = {
  name: 'canvas', description: 'Transforma contexto em uma visualização no Canvas.', whenToUse: ['mapa mental', 'diagrama', 'fluxo'], input: 'Descrição visual', output: 'Contexto pronto para Canvas', priority: 100
};

export async function execute({ input, context }) {
  const subject = context.activeTopic || input.text;
  return {
    response: `Preparei a estrutura visual de **${subject}**. O Canvas pode organizar o tema central, decisões, etapas e dependências em nós conectados.`,
    source: 'skill', canvas: true,
    representation: { type: 'mindmap', title: subject },
    action: {
      id: 'open-canvas', type: 'canvas', label: 'Abrir no Canvas', icon: 'bx-vector',
      payload: { prompt: context.enrichedText }, priority: 100, autoExecute: true
    }
  };
}

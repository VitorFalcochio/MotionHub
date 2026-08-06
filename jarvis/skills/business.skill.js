export const descriptor = {
  name: 'business', description: 'Transforma ideias vagas em uma primeira hipótese útil.', whenToUse: ['ideia de produto', 'não pensei em nada', 'negócio', 'MVP'], input: 'Ideia ou contexto ativo', output: 'Hipótese inicial e próximo experimento', priority: 71
};

function subjectFrom(input, context) {
  if (context.activeTopic) return context.activeTopic.replace(/^(um|uma)\s+/i, '');
  const match = input.text.match(/(?:quero criar|ideia de|produto para|aplicativo para|app para)\s+(.{3,100})/i)?.[1];
  return match?.replace(/[.!?]+$/, '').trim() || 'sua ideia';
}

export async function execute({ input, context, memory }) {
  const subject = subjectFrom(input, context);
  const isSocialNetwork = /rede social|comunidade/.test(`${subject} ${input.comparison}`.toLowerCase());
  const audience = isSocialNetwork
    ? 'um nicho com interesse ou objetivo em comum, começando por um grupo pequeno e identificável'
    : 'um grupo específico que enfrenta o problema com frequência e já tenta resolvê-lo de alguma forma';
  const value = isSocialNetwork
    ? 'facilitar conexões relevantes e colaboração, evitando competir inicialmente por alcance genérico'
    : 'reduzir o esforço necessário para concluir a atividade principal melhor do que as alternativas atuais';
  const knownProject = memory.recentProjects?.[0];

  return {
    response: `Vou criar uma primeira hipótese para você não começar do zero.\n\n**Ideia inicial**\nTransformar **${subject}** em uma solução com um caso de uso principal claro, em vez de tentar atender tudo no primeiro lançamento.\n\n**Público inicial**\n${audience}.\n\n**Proposta de valor**\n${value}.\n\n**MVP sugerido**\n1. Uma entrada simples para o usuário.\n2. Uma ação principal que entregue valor rapidamente.\n3. Um mecanismo de retorno ou acompanhamento.\n4. Uma forma de medir se o usuário voltaria a usar.\n\n**Primeira validação**\nConverse com cinco pessoas do público e teste se o problema, a frequência e a alternativa atual são fortes o suficiente. ${knownProject ? `Considerei **${knownProject}** como referência recente, sem alterar esse projeto.` : ''}`,
    source: 'skill',
    representation: { type: 'document', title: `Hipótese inicial: ${subject}` },
    assumptions: ['O escopo inicial deve ser pequeno e reversível.', 'A prioridade agora é validar o problema antes de ampliar funcionalidades.'],
    actions: [{
      id: 'validation-plan', type: 'prompt', label: 'Criar plano de validação', icon: 'bx-check-circle',
      payload: { prompt: `Planeje a validação concreta para ${subject} usando esta hipótese inicial` }, priority: 45
    }]
  };
}

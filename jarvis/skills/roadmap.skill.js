export const descriptor = {
  name: 'roadmap', description: 'Estrutura iniciativas em fases executáveis.', whenToUse: ['roadmap', 'cronograma', 'etapas'], input: 'Objetivo e contexto', output: 'Roadmap em fases', priority: 95
};

export async function execute({ input, context }) {
  const subject = context.activeTopic || input.text.replace(/.*roadmap(?: para| de)?/i, '').trim() || 'objetivo atual';
  return {
    response: `**Roadmap: ${subject}**\n\n1. **Descoberta** - objetivo, público, restrições e métrica de sucesso.\n2. **Definição** - escopo do MVP, riscos e critérios de aceite.\n3. **Construção** - entregas curtas, integração contínua e validação semanal.\n4. **Lançamento** - observabilidade, suporte e comunicação.\n5. **Evolução** - medir uso, priorizar feedback e reduzir dívida técnica.`,
    source: 'skill', canvas: true
  };
}

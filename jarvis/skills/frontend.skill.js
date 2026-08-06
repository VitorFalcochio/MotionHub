export const descriptor = {
  name: 'frontend', description: 'Orienta interfaces e aplicações web.', whenToUse: ['frontend', 'React', 'UI'], input: 'Dúvida de interface', output: 'Direção de frontend', priority: 76
};

export async function execute({ input, intent, context, knowledge }) {
  if (knowledge) return { response: knowledge.response, source: 'knowledge' };

  const planningRequest = intent.secondary?.includes('planner') || /\b(plano|planeje|planejamento)\b/.test(input.comparison);
  if (planningRequest) {
    const subject = context.activeTopic || input.text;
    return {
      response: `**Plano de frontend: ${subject}**\n\n1. **Escopo** - defina a ação principal, o conteúdo indispensável e o resultado esperado da primeira versão.\n2. **Fluxo** - desenhe entrada, estado vazio, carregamento, sucesso e recuperação de erro antes dos detalhes visuais.\n3. **Estrutura** - implemente layout responsivo, navegação e componentes reutilizáveis com contratos de dados explícitos.\n4. **Qualidade** - valide teclado, foco, contraste, mensagens de erro e larguras de 390 px, 768 px e 1440 px.\n5. **Entrega** - conecte dados reais, cubra o fluxo principal com um teste de interface e publique uma versão revisável.\n\n**Primeira tarefa**\nEscrever em uma frase quem usa a tela, qual a ação principal e o que confirma que ela foi concluída.`,
      source: 'skill',
      representation: { type: 'checklist', title: `Frontend: ${subject}` }
    };
  }

  return { response: '**Frontend**\nModele primeiro o fluxo, os estados e a acessibilidade. Depois decomponha a interface em componentes coesos, com dados e ações explícitos.', source: 'skill' };
}

export const descriptor = {
  name: 'architecture', description: 'Estrutura sistemas e decisões técnicas.', whenToUse: ['arquitetura', 'sistema', 'trade-off'], input: 'Problema e restrições', output: 'Arquitetura inicial', priority: 74
};

export async function execute({ input, context }) {
  const complex = input.tokens.length > 60 || /completa|detalhada|enterprise|alta escala|milhoes|multi.?tenant/.test(input.comparison);
  return {
    response: `**Arquitetura inicial${context.activeTopic ? ` para ${context.activeTopic}` : ''}**\n- Delimite usuários, casos de uso e requisitos não funcionais.\n- Separe domínio, aplicação e integrações.\n- Defina contratos, modelo de dados e estratégia de falhas.\n- Instrumente logs, métricas e rastreamento desde os fluxos críticos.\n- Registre decisões e valide riscos com protótipos pequenos.`,
    source: 'skill', canvas: true, needsGroq: complex,
    groqReason: complex ? 'arquitetura com múltiplas restrições' : ''
  };
}

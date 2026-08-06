export const descriptor = {
  name: 'backend', description: 'Orienta serviços, APIs e segurança.', whenToUse: ['backend', 'API', 'autenticação'], input: 'Dúvida de backend', output: 'Direção técnica', priority: 78
};

export async function execute({ knowledge, context }) {
  const suffix = context.activeTopic ? `\n\nNo contexto de **${context.activeTopic}**, trate autenticação, autorização e limites de domínio como decisões separadas.` : '';
  return knowledge
    ? { response: knowledge.response + suffix, source: 'knowledge' }
    : { response: '**Backend**\nDefina contratos, regras de domínio, persistência, segurança e observabilidade antes de escolher frameworks.' + suffix, source: 'skill' };
}

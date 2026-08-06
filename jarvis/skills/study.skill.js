export const descriptor = {
  name: 'study', description: 'Cria trilhas de aprendizagem.', whenToUse: ['estudar', 'aprender'], input: 'Tema e objetivo', output: 'Plano de estudo', priority: 68
};

export async function execute({ input, context }) {
  const topic = context.activeTopic || input.text.replace(/.*(?:aprender|estudar|sobre)\s+/i, '').trim();
  return { response: `**Plano de estudo: ${topic || 'tema escolhido'}**\n1. Fundamentos e vocabulário essencial.\n2. Exercício guiado pequeno.\n3. Projeto prático com critério de conclusão.\n4. Revisão dos erros e lacunas.\n5. Repetição espaçada com um desafio novo.`, source: 'skill' };
}

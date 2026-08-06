export const descriptor = {
  name: 'frontend', description: 'Orienta interfaces e aplicações web.', whenToUse: ['frontend', 'React', 'UI'], input: 'Dúvida de interface', output: 'Direção de frontend', priority: 76
};

export async function execute({ knowledge }) {
  return knowledge
    ? { response: knowledge.response, source: 'knowledge' }
    : { response: '**Frontend**\nModele primeiro o fluxo, os estados e a acessibilidade. Depois decomponha a interface em componentes coesos, com dados e ações explícitos.', source: 'skill' };
}

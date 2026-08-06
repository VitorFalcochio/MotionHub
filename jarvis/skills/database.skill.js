export const descriptor = {
  name: 'database', description: 'Orienta modelagem, consultas e persistência.', whenToUse: ['database', 'SQL', 'Postgres', 'Redis'], input: 'Dúvida de dados', output: 'Orientação de persistência', priority: 80
};

export async function execute({ knowledge }) {
  return knowledge
    ? { response: knowledge.response, source: 'knowledge' }
    : { response: '**Banco de dados**\nComece pelas entidades, invariantes e consultas reais. Escolha tecnologia e índices depois de entender consistência, volume, latência e recuperação exigidos.', source: 'skill' };
}

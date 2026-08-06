export const descriptor = {
  name: 'memory', description: 'Inspeciona e corrige a memória local do Jarvis.', whenToUse: ['lembrar', 'esquecer', 'preferências'], input: 'Consulta ou correção de memória', output: 'Memória visível ou confirmação de remoção', priority: 110
};

const TYPE_ALIASES = {
  projeto: 'projects', projetos: 'projects', tecnologia: 'technologies', tecnologias: 'technologies',
  preferencia: 'preferences', preferencias: 'preferences', objetivo: 'goals', objetivos: 'goals',
  conversa: 'conversations', conversas: 'conversations', arquivo: 'openFiles', arquivos: 'openFiles'
};

function list(label, values) {
  return values?.length ? `**${label}:** ${values.join(', ')}` : '';
}

export async function execute({ input, memory, runtime }) {
  const forget = /esqueca|esquecer|nao (guarde|lembre)/.test(input.comparison);
  if (forget) {
    const alias = Object.entries(TYPE_ALIASES).find(([name]) => input.comparison.includes(name));
    let value = input.text.match(/(?:esqueça|esqueca|não guarde|nao guarde|não lembre|nao lembre)(?: que| de| a| o)?\s+(.+)/i)?.[1]?.replace(/[.!?]+$/, '').trim();
    const type = alias?.[1];
    if (alias && value) value = value.replace(new RegExp(`^${alias[0]}s?\\s+`, 'i'), '').trim();
    const all = /toda (a )?memoria|todas (as )?memorias/.test(input.comparison);
    runtime.memory?.forget({ type, value, all });
    return {
      response: type || value
        ? `Removi ${value ? `**${value}**` : `os itens de ${alias?.[0] || 'memória'}`} da minha memória. Os artefatos do Motion Hub não foram alterados.`
        : 'Limpei a memória cognitiva local. Projetos, tarefas, documentos e outros artefatos do Motion Hub permaneceram intactos.',
      source: 'local'
    };
  }

  const lines = [
    list('Projetos recentes', memory.recentProjects),
    list('Tecnologias', memory.technologies),
    list('Preferências', memory.preferences),
    list('Objetivos', memory.goals),
    list('Arquivos recentes', memory.openFiles)
  ].filter(Boolean);
  return {
    response: lines.length
      ? `**O que estou usando como memória:**\n${lines.map(line => `- ${line}`).join('\n')}\n\nVocê pode pedir para eu esquecer uma categoria ou um item específico.`
      : 'Ainda não tenho memórias persistentes relevantes. O contexto desta conversa continua ativo apenas durante a sessão.',
    source: 'local', representation: { type: 'checklist' }
  };
}

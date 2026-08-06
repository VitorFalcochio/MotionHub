const RULES = [
  { id: 'memory', priority: 110, patterns: [/o que voce lembra|mostre (sua|minha) memoria|memorias?|esqueca|esquecer|nao (guarde|lembre)/] },
  { id: 'canvas', priority: 100, patterns: [/mapa mental|diagrama|fluxograma|visualiz|canvas|organograma/] },
  { id: 'roadmap', priority: 95, patterns: [/roadmap|plano de lancamento|cronograma de projeto|etapas para/] },
  { id: 'search', priority: 90, patterns: [/^(pesquise|pesquisar|busque|buscar)|na web|na internet|noticias|preco atual/] },
  { id: 'system', priority: 85, patterns: [/abra|navegue|mostre meus|liste minhas|crie (uma )?tarefa|agenda|motion hub|meus projetos|minhas metas|minhas tarefas|financeiro/] },
  { id: 'database', priority: 80, patterns: [/banco de dados|postgres|redis|sql|modelagem|schema|query/] },
  { id: 'backend', priority: 78, patterns: [/backend|servidor|endpoint|autenticacao|jwt|docker|api rest|microsservico/] },
  { id: 'frontend', priority: 76, patterns: [/frontend|react|interface|componente|css|responsiv|acessibilidade/] },
  { id: 'architecture', priority: 74, patterns: [/arquitetura|sistema escalavel|desenhe um sistema|stack|trade.?off/] },
  { id: 'debug', priority: 73, patterns: [/\bdebug|depur|erro|falha|bug|nao funciona|401|403|404|500\b/] },
  { id: 'coding', priority: 72, patterns: [/programar|codigo|javascript|typescript|python|refator|implementar/] },
  { id: 'study', priority: 68, patterns: [/estudar|aprender|trilha de estudo|plano de estudos|me ensine/] },
  { id: 'planner', priority: 66, patterns: [/planeje|planejamento|priorize|organize meu dia|proximos passos|crie um plano|plano de validacao/] },
  { id: 'business', priority: 64, patterns: [/nao pensei em nada|me ajude com (essas )?perguntas|quero criar (um|uma)|ideia de|modelo de negocio|monetiz|publico.?alvo|proposta de valor|\bmvp\b|rede social/] },
  { id: 'knowledge', priority: 50, patterns: [/^(o que e|explique|como funciona|qual a diferenca|para que serve)/] }
];

export class IntentEngine {
  classify(input) {
    const matches = RULES
      .filter(rule => rule.patterns.some(pattern => pattern.test(input.comparison)))
      .sort((a, b) => b.priority - a.priority);
    const winner = matches[0];
    const entities = {
      technologies: input.tokens.filter(token => ['javascript', 'typescript', 'react', 'node', 'docker', 'jwt', 'redis', 'postgres', 'python'].includes(token)),
      dates: input.comparison.match(/\b(?:hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/g) || [],
      urls: input.raw.match(/https?:\/\/\S+/g) || []
    };
    return {
      name: winner?.id || 'general',
      confidence: winner ? Math.min(0.98, 0.68 + matches.length * 0.08) : 0.25,
      secondary: matches.slice(1, 4).map(item => item.id),
      alternatives: matches.slice(1, 4).map(item => item.id),
      evidence: winner ? winner.patterns.filter(pattern => pattern.test(input.comparison)).map(String) : [],
      entities
    };
  }
}

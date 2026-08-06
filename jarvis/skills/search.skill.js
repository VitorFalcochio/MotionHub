export const descriptor = {
  name: 'search', description: 'Pesquisa informações externas e atuais.', whenToUse: ['pesquisa web', 'notícias', 'preços atuais'], input: 'Consulta verificável', output: 'Síntese com fontes e data', priority: 90
};

function formatResult(item) {
  const title = item.title || item.url || 'Fonte';
  const summary = String(item.snippet || item.content || item.description || '').trim().slice(0, 280);
  return `- **${title}**${summary ? ` — ${summary}` : ''}${item.url ? `\n  ${item.url}` : ''}`;
}

export async function execute({ input, runtime }) {
  if (!runtime.webSearch) {
    return {
      response: 'A pesquisa web não está conectada neste ambiente. Posso continuar com conhecimento local ou tentar novamente quando a integração estiver disponível.',
      source: 'local', status: 'blocked', error: { code: 'web_unavailable', recoverable: true },
      actions: [{ id: 'retry-search', type: 'prompt', label: 'Tentar novamente', icon: 'bx-refresh', payload: { prompt: input.text }, priority: 60 }]
    };
  }
  const query = input.text.replace(/^(pesquise|pesquisar|busque|buscar)( por| sobre)?\s*/i, '').trim() || input.text;
  try {
    const data = await runtime.webSearch({ query, max_results: 6, search_depth: 'basic' });
    if (!data?.success || !data.results?.length) throw new Error(data?.error || 'Nenhum resultado encontrado.');
    return {
      response: `**Pesquisa verificada em ${new Date().toLocaleDateString('pt-BR')}**\n\n${data.results.slice(0, 6).map(formatResult).join('\n')}`,
      source: 'web', representation: { type: 'document', title: `Pesquisa: ${query}` },
      actions: [{ id: 'refine-search', type: 'prompt', label: 'Refinar pesquisa', icon: 'bx-filter-alt', payload: { prompt: `Refine a pesquisa sobre ${query}` }, priority: 30 }]
    };
  } catch (error) {
    return {
      response: `Não consegui concluir a pesquisa: ${error.message}\n\nO restante do Motion Hub permaneceu intacto.`,
      source: 'fallback', status: 'failed', error: { code: 'web_search_failed', recoverable: true },
      actions: [{ id: 'retry-search', type: 'prompt', label: 'Tentar novamente', icon: 'bx-refresh', payload: { prompt: input.text }, priority: 60 }]
    };
  }
}

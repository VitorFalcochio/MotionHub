import { handleOptions, jsonError, setCors } from './_utils.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const query = String(req.body?.query || '').trim().slice(0, 400);
  const maxResults = Math.min(Math.max(Number(req.body?.max_results || 6), 3), 8);
  if (!query) return jsonError(res, 400, 'Informe uma busca em query.');

  try {
    const result = process.env.TAVILY_API_KEY
      ? await searchTavily(query, maxResults, req.body?.search_depth)
      : process.env.BRAVE_SEARCH_API_KEY
        ? await searchBrave(query, maxResults)
        : { success: false, error: 'Pesquisa web não configurada no servidor.' };
    return res.status(result.success ? 200 : 503).json(result);
  } catch (error) {
    return jsonError(res, 502, error.message || 'Falha no provedor de pesquisa.');
  }
}

async function searchTavily(query, maxResults, depth) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: maxResults, search_depth: depth === 'advanced' ? 'advanced' : 'basic', include_answer: true })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { success: false, error: data.error || `Tavily HTTP ${response.status}` };
  return {
    success: true, provider: 'tavily', query, answer: data.answer || '',
    results: (data.results || []).slice(0, maxResults).map(item => ({ title: item.title || item.url, url: item.url, snippet: item.content || '', published_date: item.published_date || '', score: item.score }))
  };
}

async function searchBrave(query, maxResults) {
  const params = new URLSearchParams({ q: query, count: String(maxResults), safesearch: 'moderate' });
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
    headers: { Accept: 'application/json', 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { success: false, error: data.error?.message || `Brave HTTP ${response.status}` };
  return {
    success: true, provider: 'brave', query, answer: '',
    results: (data.web?.results || []).slice(0, maxResults).map(item => ({ title: item.title || item.url, url: item.url, snippet: item.description || '', published_date: item.age || '', score: null }))
  };
}

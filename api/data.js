import { isAuthorized, loadData } from '../lib/hub-core.js';
import { handleOptions, jsonError, setCors } from './_utils.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');
  if (!isAuthorized(req.headers.authorization || '')) return jsonError(res, 401, 'Unauthorized');

  try {
    res.status(200).json(await loadData());
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

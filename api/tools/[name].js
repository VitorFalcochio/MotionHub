import { isAuthorized, runTool } from '../../lib/hub-core.js';
import { handleOptions, jsonError, setCors } from '../_utils.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  if (!isAuthorized(req.headers.authorization || '')) return jsonError(res, 401, 'Unauthorized');

  try {
    const { name } = req.query;
    const result = await runTool(String(name), req.body || {});
    res.status(result?.success === false ? 400 : 200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

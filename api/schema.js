import { isAuthorized, toolSchemas } from '../lib/hub-core.js';
import { handleOptions, jsonError, setCors } from './_utils.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');
  if (!isAuthorized(req.headers.authorization || '')) return jsonError(res, 401, 'Unauthorized');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || '';
  res.status(200).json({
    baseUrl: host ? `${proto}://${host}` : '',
    auth: 'Authorization: Bearer <HUB_API_TOKEN>',
    callTool: 'POST /api/tools/:name',
    tools: toolSchemas
  });
}

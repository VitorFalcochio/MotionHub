export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

export function handleOptions(req, res) {
  if (req.method !== 'OPTIONS') return false;
  setCors(res);
  res.status(204).end();
  return true;
}

export function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}

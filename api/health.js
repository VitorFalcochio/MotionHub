import { handleOptions, setCors } from './_utils.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  res.status(200).json({ ok: true, service: 'motion-hub-api' });
}

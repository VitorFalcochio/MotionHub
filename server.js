import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAuthorized, loadData, runTool, toolSchemas } from './lib/hub-core.js';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

await loadEnv();

const port = Number(process.env.PORT || 3333);

const server = createServer(async (req, res) => {
  try {
    setCors(res);

    if (req.method === 'OPTIONS') {
      return sendJson(res, 204, null);
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'motion-hub-api' });
    }

    if (url.pathname === '/api/schema') {
      if (!isAuthorized(req.headers.authorization || '')) return sendJson(res, 401, { error: 'Unauthorized' });
      return sendJson(res, 200, {
        baseUrl: `http://localhost:${port}`,
        auth: 'Authorization: Bearer <HUB_API_TOKEN>',
        callTool: 'POST /api/tools/:name',
        tools: toolSchemas
      });
    }

    if (url.pathname.startsWith('/api/tools/')) {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!isAuthorized(req.headers.authorization || '')) return sendJson(res, 401, { error: 'Unauthorized' });

      const name = decodeURIComponent(url.pathname.replace('/api/tools/', ''));
      const args = await readJson(req);
      const result = await runTool(name, args || {});
      return sendJson(res, result?.success === false ? 400 : 200, result);
    }

    if (url.pathname === '/api/data') {
      if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!isAuthorized(req.headers.authorization || '')) return sendJson(res, 401, { error: 'Unauthorized' });
      return sendJson(res, 200, await loadData());
    }

    if (req.method === 'GET') {
      return serveStatic(url.pathname, res);
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`Motion Hub API rodando em http://localhost:${port}`);
  if (!process.env.HUB_API_TOKEN) console.warn('Aviso: defina HUB_API_TOKEN antes de conectar o Jarvis.');
  if (!process.env.HUB_EMAIL || !process.env.HUB_PASSWORD) console.warn('Aviso: defina HUB_EMAIL e HUB_PASSWORD para acessar o Supabase.');
});

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  if (status === 204) return res.end();
  res.end(JSON.stringify(data, null, 2));
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

async function serveStatic(pathname, res) {
  const requested = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = resolve(join(ROOT, requested));
  if (!filePath.startsWith(resolve(ROOT))) return sendJson(res, 403, { error: 'Forbidden' });

  try {
    const file = await readFile(filePath);
    const type = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.png': 'image/png'
    }[extname(filePath)] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': type });
    res.end(file);
  } catch {
    sendJson(res, 404, { error: 'Not found' });
  }
}

async function loadEnv() {
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional; environment variables can be provided by the shell.
  }
}

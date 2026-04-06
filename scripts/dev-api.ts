/**
 * Local development API server — mirrors Vercel serverless function behaviour
 * so that `npm run dev:api` serves /api/* on port 3001 alongside Vite on 5173.
 *
 * Run both together: `npm run dev:all`
 */
import http from 'node:http';
import { URL } from 'node:url';

const PORT = 3001;

// Dynamically import handlers so they pick up any edits on restart
async function getHandler(pathname: string) {
  // Strip leading /api/ to get the module path
  const rel = pathname.replace(/^\/api\//, '');
  const modulePath = new URL(`../api/${rel}.ts`, import.meta.url);
  // Clear cache by appending a bust param (tsx doesn't support HMR, restart needed)
  const mod = await import(modulePath.pathname);
  return mod.default as (req: Request) => Promise<Response>;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  // Only handle /api/* routes
  if (!url.pathname.startsWith('/api/')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Read body
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = Buffer.concat(chunks);

  // Build a Web API Request that the handlers expect
  const webReq = new Request(`http://localhost:${PORT}${url.pathname}${url.search}`, {
    method: req.method ?? 'GET',
    headers: req.headers as HeadersInit,
    body: body.length > 0 ? body : null,
  });

  try {
    const handler = await getHandler(url.pathname);
    const webRes = await handler(webReq);

    res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));
    const buf = await webRes.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (e) {
    console.error('[dev-api]', e);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: (e as Error).message }));
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api] Listening on http://localhost:${PORT}`);
});

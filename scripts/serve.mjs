/**
 * Static file server for the browser tests, and for looking at docs/ locally:
 *
 *   node scripts/serve.mjs          # repo root on :4173
 *   node scripts/serve.mjs --port 8080
 *
 * The tests need the repo root, not docs/, because they load both the published
 * entry point (/kape-icon.js) and the site (/docs/index.html) from one origin.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const portArg = process.argv.indexOf('--port');
const port = portArg === -1 ? 4173 : Number(process.argv[portArg + 1]);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  // normalize collapses ../ so a request cannot climb out of the repo.
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path.endsWith('/')) path += 'index.html';

  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});

server.listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));

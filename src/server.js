import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { config } from './config.js';
import { AppError } from './errors.js';
import { validateRequest } from './contract.js';
import { createOpenAIProvider } from './provider.js';
const MAX_BODY = 128 * 1024;
const send = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
};
async function readJSON(req) {
  if ((req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') throw new AppError(415, 'unsupported_media_type', 'Use Content-Type: application/json');
  if (Number(req.headers['content-length']) > MAX_BODY) { req.resume(); throw new AppError(413, 'body_too_large', 'Maximum body size is 128 KiB'); }
  // Drain oversized chunked requests without destroying the socket before the 413 response.
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0, tooLarge = false;
    req.on('data', chunk => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > MAX_BODY) {
        tooLarge = true; chunks.length = 0;
        reject(new AppError(413, 'body_too_large', 'Maximum body size is 128 KiB'));
      } else chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new AppError(400, 'invalid_json', 'Request body must be valid JSON')); }
    });
    req.on('error', () => reject(new AppError(400, 'request_aborted', 'Request body was interrupted')));
  });
}
export function createServer({ settings = config(), provider = createOpenAIProvider(settings) } = {}) {
  return http.createServer({ requestTimeout: 300000, headersTimeout: 10000 }, async (req, res) => {
    try {
      if (req.url === '/health' && req.method === 'GET') return send(res, 200, { status: 'ok' });
      if (req.url !== '/v1/systemone') throw new AppError(404, 'not_found', 'Use POST /v1/systemone');
      if (req.method !== 'POST') throw new AppError(405, 'method_not_allowed', 'Use POST /v1/systemone');
      if (settings.serviceKey) {
        const actual = Buffer.from(req.headers.authorization || '');
        const expected = Buffer.from(`Bearer ${settings.serviceKey}`);
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new AppError(401, 'unauthorized', 'Missing or invalid Bearer token');
      }
      const request = validateRequest(await readJSON(req));
      // The Jev model field is a compatibility alias, never misrepresent it as the executing model.
      if (![settings.openaiModel, 'jev-latest', 'local-gpt'].includes(request.model)) throw new AppError(422, 'unsupported_model', 'Local model must be jev-latest, local-gpt or the configured OPENAI_MODEL');
      const result = await provider(request);
      send(res, 200, result);
    } catch (error) {
      const known = error instanceof AppError;
      if (!res.destroyed) send(res, known ? error.status : 500, {
        error: { code: known ? error.code : 'internal_error', message: known ? error.message : 'Internal server error', ...(known && error.details ? { details: error.details } : {}) },
      });
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const settings = config();
  const server = createServer({ settings });
  server.listen(settings.port, settings.host, () => console.log(`Jev-compatible service: http://${settings.host}:${server.address().port}`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}

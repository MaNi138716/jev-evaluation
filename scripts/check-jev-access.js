// Read-only connectivity diagnostic. Does not perform model inference.
import { config } from '../src/config.js';
const settings = config();
try {
  if (!settings.jevKey) throw new Error('Missing TYPESAFE_API_KEY');
  const response = await fetch(`${settings.jevBase}/v1/models`, {
    headers: { Authorization: `Bearer ${settings.jevKey}` }, redirect: 'error', signal: AbortSignal.timeout(15000),
  });
  let body = await response.text();
  for (const key of [settings.jevKey, settings.openaiKey]) if (key) body = body.replaceAll(key, '[REDACTED]');
  console.log(JSON.stringify({ status: response.status, content_type: response.headers.get('content-type'), body: body.slice(0, 1800) }, null, 2));
  if (!response.ok) process.exitCode = 1;
} catch (error) { console.error(error.message); process.exitCode = 1; }

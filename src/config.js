function integer(env, name, fallback, min, max) {
  const n = Number(env[name] ?? fallback);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Invalid ${name}`);
  return n;
}
export function config(env = process.env) {
  return {
    openaiKey: env.OPENAI_API_KEY || '', openaiModel: env.OPENAI_MODEL || 'gpt-4o-mini',
    openaiBase: (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    jevKey: env.TYPESAFE_API_KEY || env.JEV_API_KEY || '', jevModel: env.JEV_MODEL || 'jev-latest',
    jevBase: (env.JEV_BASE_URL || 'https://api.typesafe.ai').replace(/\/$/, ''),
    localBase: (env.LOCAL_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, ''),
    serviceKey: env.SERVICE_API_KEY || '', host: env.HOST || '127.0.0.1',
    port: integer(env, 'PORT', 8000, 0, 65535),
    timeout: integer(env, 'REQUEST_TIMEOUT_MS', 60000, 100, 300000),
    retries: integer(env, 'MAX_RETRIES', 2, 0, 5),
  };
}

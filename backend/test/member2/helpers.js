// Member 2 test helpers: boot the compiled NestJS app (same global setup as src/main.ts)
// on a random port. Run `npx nest build` first.
const path = require('node:path');

const DIST = path.resolve(__dirname, '..', '..', 'dist');

async function startApp(env = {}) {
  const previous = {};
  for (const [k, v] of Object.entries(env)) {
    previous[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  // Fresh module instances per boot so env-dependent providers re-read configuration.
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(DIST)) delete require.cache[key];
  }
  const { NestFactory } = require('@nestjs/core');
  const { ValidationPipe } = require('@nestjs/common');
  const { AppModule } = require(path.join(DIST, 'app.module'));

  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0);
  const { port } = app.getHttpServer().address();
  const base = `http://127.0.0.1:${port}/api/v1`;

  async function call(method, urlPath, body) {
    const res = await fetch(base + urlPath, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = text;
    }
    return { status: res.status, body: json };
  }

  return {
    app,
    base,
    get: (p) => call('GET', p),
    post: (p, b) => call('POST', p, b),
    put: (p, b) => call('PUT', p, b),
    patch: (p, b) => call('PATCH', p, b),
    del: (p) => call('DELETE', p),
    async close() {
      await app.close();
      for (const [k, v] of Object.entries(previous)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    },
  };
}

const qs = (params) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    for (const item of Array.isArray(v) ? v : [v]) sp.append(k, String(item));
  }
  return '?' + sp.toString();
};

module.exports = { startApp, qs };

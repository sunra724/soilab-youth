// Run after npm run build, using the website's Notion environment.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const manifest = JSON.parse(await readFile('.next/prerender-manifest.json', 'utf8'));
for (const route of ['/cardnews/[id]', '/newsletter/[id]']) {
  assert.ok(manifest.dynamicRoutes[route], `${route} must support ISR`);
}
assert.equal(manifest.routes['/morning'], undefined, 'Member pages must remain dynamic');

const socket = createServer();
await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  windowsHide: true,
  stdio: 'ignore',
});

async function read(path, expected = 200, headers) {
  const response = await fetch(`${origin}${path}`, { headers, signal: AbortSignal.timeout(30_000) });
  const html = await response.text();
  assert.equal(response.status, expected, path);
  return { response, html };
}

async function cached(path, seconds) {
  let result;
  for (let attempt = 0; attempt < 30; attempt++) {
    result = await read(path);
    if (result.response.headers.get('x-nextjs-cache') === 'HIT') break;
    await delay(200);
  }
  assert.equal(result.response.headers.get('x-nextjs-cache'), 'HIT', path);
  assert.match(result.response.headers.get('cache-control'), new RegExp(`s-maxage=${seconds}(?:,|$)`));
  assert.ok(result.html.includes(`https://www.soilab-youth.kr${path}`), `Canonical missing: ${path}`);
  assert.ok(/<h1\b/.test(result.html), `Heading missing: ${path}`);
  return result;
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await read('/robots.txt'); ready = true; break; } catch {}
    if (server.exitCode !== null) break;
    await delay(200);
  }
  assert.ok(ready, 'Production server did not start');
  const samples = [];
  for (const [kind, seconds] of [['cardnews', 3600], ['newsletter', 600]]) {
    const list = await read(`/${kind}`);
    const paths = [...new Set([...list.html.matchAll(new RegExp(`href="(/${kind}/[^"?#]+)"`, 'g'))].map(match => match[1]))].slice(0, 2);
    assert.equal(paths.length, 2, `Expected published ${kind} samples; check the build environment`);
    for (const path of paths) {
      const first = await read(path);
      const second = await cached(path, seconds);
      assert.equal(second.html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1], first.html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1]);
      samples.push({ path, seconds });
    }
  }
  await read('/cardnews/00000000-0000-0000-0000-000000000000', 404);
  const absent = await fetch(`${origin}/newsletter/1900-01-01`);
  const absentHtml = await absent.text();
  // Next.js can send a streamed 200 before an async lookup calls notFound().
  // Preserve the existing noindex + not-found response in either transport mode.
  assert.ok([200, 404].includes(absent.status));
  assert.match(absentHtml, /NEXT_HTTP_ERROR_FALLBACK;404/);
  assert.match(absentHtml, /name="robots" content="noindex"/);
  await read('/api/revalidate', 401);
  assert.ok(process.env.CRON_SECRET, 'Local cache invalidation requires CRON_SECRET');
  await read('/api/revalidate', 200, { authorization: `Bearer ${process.env.CRON_SECRET}` });
  for (const { path, seconds } of samples) {
    const invalidated = await read(path);
    assert.notEqual(invalidated.response.headers.get('x-nextjs-cache'), 'HIT', `Invalidation missed ${path}`);
    await cached(path, seconds);
  }
  console.log('Detail cache checks passed: four public pages, 1h/10m cache headers, canonical URLs, missing-item responses, protected invalidation and fresh cache after invalidation.');
} finally {
  server.kill();
}

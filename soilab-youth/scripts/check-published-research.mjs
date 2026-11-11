import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

const published = JSON.parse(readFileSync(new URL('../tests/fixtures/published-research.json', import.meta.url), 'utf8'));
let base = process.argv.find(arg => arg.startsWith('--base='))?.slice(7);
const remote = Boolean(base);
let server;
try {
  if (!base) {
    const socket = createServer();
    await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    base = 'http://127.0.0.1:' + port;
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { windowsHide: true, stdio: 'ignore' });
    let ready = false;
    for (let n = 0; n < 75; n++) {
      try { const response = await fetch(base + '/robots.txt'); if (response.ok) { ready = true; break; } } catch {}
      if (server.exitCode !== null) break;
      await delay(200);
    }
    assert.ok(ready, 'Local Next.js server did not start');
  }
  const paths = [
    ...published.notes.map(id => '/research/notes/' + id),
    ...published.evidence.map(id => '/research/evidence/' + id),
    ...(remote ? published.reviewedEvidence.map(id => '/research/evidence/' + id) : []),
    '/livinglab/neighborhood', '/research/notes/incheon-research',
  ];
  let index = 0;
  const failures = [];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (index < paths.length) {
      const path = paths[index++];
      try {
        const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
        const html = await response.text();
        assert.equal(response.status, 200, path);
        assert.ok(!html.includes('NEXT_HTTP_ERROR_FALLBACK;404'), path + ' rendered a missing page');
        assert.match(html, /<h1\b/, path + ' has no heading');
      } catch { failures.push(path); }
    }
  }));
  assert.deepEqual(failures, [], 'Previously published URLs failed');
  const redirects = [
    ['/.../incheon-research', '/research/notes/incheon-research'],
    ['/.../incheon-research...', '/research/notes/incheon-research'],
    ['/.../youth-social-security-and', '/research/notes/youth-social-security-and-returning-to-support'],
  ];
  for (const [path, destination] of redirects) {
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, 308, path);
    assert.equal(new URL(response.headers.get('location'), base).pathname, destination, path);
  }
  for (const path of ['/xxx/incheon-research', '/.../not-a-real-note', '/research/notes/not-a-real-note']) {
    const response = await fetch(base + path);
    const html = await response.text();
    assert.equal(response.status, 404, path);
    assert.match(html, /페이지를 찾을 수 없습니다/, path);
    assert.match(html, /name="robots" content="noindex"/, path);
    // Async notFound responses can carry the recovery component in the RSC payload.
    assert.ok(html.includes('href="/research/notes"') || html.replaceAll('\\"', '"').includes('"href":"/research/notes"'), path + ' recovery link missing');
  }
  console.log(JSON.stringify({ checkedPublicPages: paths.length, recoveredAliases: redirects.length, unknownPathsRemain404: 3, failures: 0 }));
} finally { server?.kill(); }

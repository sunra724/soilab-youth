import assert from 'node:assert/strict';
import test from 'node:test';
import { generateKeyPairSync, verify } from 'node:crypto';
import { canonicalLedgerUrl, entryIdentity, ITEM_HEADERS, RUN_HEADERS, ledgerHash, queueEntries, sheetKstTimestamp } from '../src/lib/research/ledger-core.ts';
import { createSheetsClient } from '../src/lib/research/ledger-sheets.ts';
import { captureLedgerBatch, flushLedger, ledgerEnabled } from '../src/lib/research/ledger-bridge.ts';
import { collectDailyCandidates } from '../src/lib/research/daily.ts';

const now = () => new Date('2026-11-10T22:00:00Z');
const item = { title: '고립·은둔 청년 연구', publisher: '연구기관', url: 'https://media.example/view?id=42&utm_source=feed#section', checked_at: now().toISOString(), published_at: '2026-11-10', excerpt: 'PRIVATE_RAW_BODY', raw: 'SECRET_RAW_RESPONSE' };
const source = { id: 'kr_policy', source_type: 'news', status: 'success', item_count: 1 };
const batch = { items: [item], sources: [source], started_at: now().toISOString(), finished_at: now().toISOString() };
const entry = { ...queueEntries(batch, 'fixture')[0], sheet_row: 2 };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const env = { YOUTH_LEDGER_ENABLED: 'true', YOUTH_LEDGER_SHEET_ID: 'fixtureSheetId00000000000000', SUPABASE_URL: 'https://database.example', SUPABASE_SERVICE_ROLE_KEY: 'fixture-service-key',
  YOUTH_LEDGER_GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({ type: 'service_account', client_email: 'fixture@test.iam.gserviceaccount.com', private_key: pair.privateKey.export({ type: 'pkcs8', format: 'pem' }) }) };

function google(options = {}) {
  const state = { rows: {}, requests: [], auths: 0, failed: false, grid: options.grid || 1000 };
  const metadata = () => ({ properties: { timeZone: 'Asia/Seoul' }, sheets: [
    { properties: { title: 'items', sheetId: 1, gridProperties: { rowCount: state.grid, columnCount: 26 } }, tables: [{ tableId: 'items-table', range: { endRowIndex: 2, endColumnIndex: 25 } }] },
    { properties: { title: 'source_runs', sheetId: 2, gridProperties: { rowCount: 1000, columnCount: 26 } }, tables: [{ tableId: 'runs-table', range: { endRowIndex: 2, endColumnIndex: 8 } }] },
    { properties: { title: 'config', sheetId: 3, gridProperties: { rowCount: 1000, columnCount: 26 } } },
  ] });
  const fetcher = async (address, init) => {
    const url = new URL(address);
    if (url.hostname === 'oauth2.googleapis.com') {
      state.auths++;
      const assertion = new URLSearchParams(init.body).get('assertion');
      const [header, payload, signature] = assertion.split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64url'));
      assert.equal(claims.scope, 'https://www.googleapis.com/auth/spreadsheets');
      assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
      assert.equal(verify('RSA-SHA256', Buffer.from(header + '.' + payload), pair.publicKey, Buffer.from(signature, 'base64url')), true);
      return json({ access_token: 'fixture-access-token' });
    }
    if (options.httpError) return json({ error: 'PRIVATE_KEY_SHOULD_NOT_LEAK' }, options.httpError);
    if (url.pathname.endsWith('/values:batchGet')) {
      return json({ valueRanges: url.searchParams.getAll('ranges').map(range => {
        if (range === 'items!A1:Y1') return { values: [options.wrongHeader ? ['wrong'] : ITEM_HEADERS] };
        if (range === 'source_runs!A1:H1') return { values: [RUN_HEADERS] };
        if (range.startsWith('config!')) return { values: [['key', 'value', 'description'], ['pipeline_mode', 'not_connected', '']] };
        const [name, cell] = range.split('!');
        const row = Number(cell.match(/\d+/)[0]);
        if (name === 'items' && row > state.grid) throw new Error('range_outside_grid');
        return { values: [state.rows[name + ':' + row] || []] };
      }) });
    }
    if (url.pathname.endsWith(':batchUpdate')) {
      const requests = JSON.parse(init.body).requests;
      state.requests.push(requests);
      for (const request of requests) {
        if (request.appendDimension?.sheetId === 1) state.grid += request.appendDimension.length;
        if (!request.updateCells) continue;
        const { range, rows } = request.updateCells;
        const name = { 1: 'items', 2: 'source_runs', 3: 'config' }[range.sheetId];
        const key = name + ':' + (range.startRowIndex + 1);
        const row = state.rows[key] ||= [];
        rows[0].values.forEach((cell, index) => {
          const v = cell.userEnteredValue || {};
          row[range.startColumnIndex + index] = v.stringValue ?? v.numberValue ?? v.boolValue ?? '';
        });
      }
      if (options.loseResponse && !state.failed && requests.some(r => r.updateCells?.range.sheetId === 1)) {
        state.failed = true;
        throw new Error('PRIVATE_NETWORK_ERROR');
      }
      return json({ replies: requests.map(() => ({})) });
    }
    return json(metadata());
  };
  return { state, fetcher };
}

test('tracking URL dedup keeps document parameters and never stores raw responses or RSS dates as original publication dates', () => {
  assert.equal(canonicalLedgerUrl(item.url), 'https://media.example/view?id=42');
  assert.equal(canonicalLedgerUrl('https://media.example/view?id=43'), 'https://media.example/view?id=43');
  for (const url of ['http://127.0.0.1/a', 'http://172.20.1.1/a', 'http://[::1]/a', 'https://user:password@site.example/a', 'https://site.example/api?serviceKey=secret']) assert.equal(canonicalLedgerUrl(url), null);
  const entries = queueEntries({ ...batch, items: [item, { ...item, url: 'https://media.example/view?utm_campaign=other&id=42' }, { ...item, url: 'https://other.example/view?id=42' }] }, 'fixture');
  assert.equal(entries.filter(row => row.target === 'items').length, 2);
  const payload = JSON.stringify(entries);
  assert.doesNotMatch(payload, /PRIVATE_RAW_BODY|SECRET_RAW_RESPONSE|published_at/);
  assert.equal(entries[0].dedupe_key, ledgerHash('https://media.example/view?id=42'));
});

test('KST cells and source titles are written as data; review and publication columns are preserved', async () => {
  const mock = google();
  await createSheetsClient(env, mock.fetcher, now).write([entry]);
  const row = mock.state.rows['items:2'];
  assert.equal(row[0], '20261111-001');
  assert.equal(row[2], sheetKstTimestamp(item.checked_at));
  assert.equal(row[3], undefined);
  assert.equal(row[18], undefined);
  assert.equal(row[24], 'source_verification_pending');
  assert.equal(mock.state.auths, 1);
  const formulaEntry = { ...entry, sheet_row: 3, payload: { ...entry.payload, title: '=IMPORTXML("https://evil.example","x")' } };
  await createSheetsClient(env, mock.fetcher, now).write([formulaEntry]);
  assert.equal(mock.state.rows['items:3'][6], formulaEntry.payload.title);
  for (const request of mock.state.requests.flat()) if (request.updateCells) {
    for (const row of request.updateCells.rows) for (const cell of row.values) assert.equal(cell.userEnteredValue?.formulaValue, undefined);
  }
});

test('unknown write response is retried by identity, preserving subsequent human review edits', async () => {
  const mock = google({ loseResponse: true });
  await assert.rejects(createSheetsClient(env, mock.fetcher, now).write([entry]), /^Error: ledger_sheets_unavailable$/);
  const row = mock.state.rows['items:2'];
  row[3] = 46336; row[18] = '사람이 확인한 사실'; row[24] = 'reviewed';
  const result = await createSheetsClient(env, mock.fetcher, now).write([entry]);
  assert.equal(result.written, 0);
  assert.equal(result.alreadyPresent, 1);
  assert.equal(row[18], '사람이 확인한 사실');
  assert.equal(row[24], 'reviewed');
});

test('schema changes and occupied rows stop safely without overwriting content', async () => {
  for (const wrongHeader of [false, true]) {
    const mock = google({ wrongHeader });
    mock.state.rows['items:2'] = ['R-manual', 'manual'];
    await assert.rejects(createSheetsClient(env, mock.fetcher, now).write([entry]),
      wrongHeader ? /header_mismatch/ : /row_collision/);
    assert.equal(mock.state.requests.length, 0);
    assert.equal(mock.state.rows['items:2'][0], 'R-manual');
  }
});

test('grid and native table grow before writing a durable row beyond the initial grid', async () => {
  const mock = google({ grid: 10 });
  const later = { ...entry, sheet_row: 1002 };
  await createSheetsClient(env, mock.fetcher, now).write([later]);
  assert.equal(mock.state.grid, 1002);
  assert.equal(mock.state.rows['items:1002'][0], entryIdentity(later));
  assert.ok(mock.state.requests.flat().some(r => r.updateTable?.table.range.endRowIndex === 1002));
});

test('preview and disabled runs perform no writes; missing Google credentials keep the durable buffer pending', async () => {
  assert.equal(ledgerEnabled({ ...env, VERCEL_ENV: 'preview' }), false);
  let calls = 0;
  const fetcher = async () => { calls++; throw new Error(); };
  assert.equal((await captureLedgerBatch(batch, { env: { ...env, YOUTH_LEDGER_ENABLED: 'false' }, fetcher })).status, 'disabled');
  assert.equal((await flushLedger({ env: { ...env, YOUTH_LEDGER_GOOGLE_SERVICE_ACCOUNT_JSON: '' }, fetcher })).status, 'awaiting_google_credentials');
  assert.equal(calls, 0);
});

test('a Sheets permission failure releases the queue with a redacted error, without acknowledging rows', async () => {
  const mock = google({ httpError: 403 });
  const calls = [];
  const fetcher = async (url, init) => {
    if (String(url).includes('/rpc/')) {
      const method = String(url).split('youth_ledger_')[1];
      calls.push({ method, payload: JSON.parse(init.body) });
      return json(method === 'claim' ? [entry] : null);
    }
    return mock.fetcher(url, init);
  };
  await assert.rejects(flushLedger({ env, fetcher, now }), /^Error: ledger_sheets_http_403$/);
  assert.deepEqual(calls.map(c => c.method), ['claim', 'release']);
  assert.equal(calls[1].payload._code, 'ledger_sheets_http_403');
});

test('a lost database acknowledgement reuses the written row and preserves human edits on the next flush', async () => {
  const mock = google();
  let pending = true;
  let loseAck = true;
  const methods = [];
  const fetcher = async (url, init) => {
    if (!String(url).includes('/rpc/')) return mock.fetcher(url, init);
    const method = String(url).split('youth_ledger_')[1];
    methods.push(method);
    if (method === 'claim') return json(pending ? [entry] : []);
    if (method === 'ack') {
      const payload = JSON.parse(init.body);
      assert.deepEqual(payload._rows, [2]);
      if (loseAck) { loseAck = false; return json({}, 503); }
      pending = false; return json(1);
    }
    return json(null);
  };
  await assert.rejects(flushLedger({ env, fetcher, now }), /ledger_database_http_503/);
  assert.deepEqual(methods, ['claim', 'ack', 'release']);
  mock.state.rows['items:2'][18] = '사람 검토 결과 보존';
  const result = await flushLedger({ env, fetcher, now });
  assert.equal(result.synced, 1);
  assert.equal(mock.state.rows['items:2'][18], '사람 검토 결과 보존');
  const identityWrites = mock.state.requests.flat().filter(request => request.updateCells?.range.sheetId === 1 && request.updateCells.range.startColumnIndex === 0);
  assert.equal(identityWrites.length, 1);
});

test('all collected items reach the buffer before history selection; capture failures do not break the original collection', async () => {
  const props = { api: 'https://archive.example/api/research/briefings' };
  const rss = '<rss><channel><item><title>고립·은둔 청년 연구</title><link>https://media.example/a</link><pubDate>Wed, 11 Nov 2026 00:00:00 GMT</pubDate></item></channel></rss>';
  let captured;
  const runtime = { now: () => new Date('2026-11-11T01:00:00Z'),
    fetcher: async url => String(url).includes('/sources?') ? json({ available: true, items: [] }) : new Response(rss),
    onCollected: async data => { captured = data; },
  };
  const result = await collectDailyCandidates(props, ['고립·은둔 청년 연구'], runtime);
  assert.equal(result.items.length, 0);
  assert.equal(captured.items.length, 5);
  assert.equal(captured.sources.length, 6);
  let failures = 0;
  const unaffected = await collectDailyCandidates(props, [], { ...runtime,
    onCollected: async () => { throw new Error('database unavailable'); },
    onCollectionError: () => { failures++; },
  });
  assert.equal(unaffected.items.length, 1);
  assert.equal(failures, 1);
  await assert.rejects(collectDailyCandidates(props, [], { ...runtime, fetcher: async () => json({}, 503) }), /all_sources_failed/);
  assert.equal(captured.sources.every(source => source.status === 'failed'), true);
});

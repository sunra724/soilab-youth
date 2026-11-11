import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const key = 'a'.repeat(40);
const entry = { target: 'items', dedupe_key: key, payload: { title: '고립·은둔 청년 연구', url: 'https://media.example/a',
  collected_at: '2026-11-10T22:00:00Z', source_type: 'news', source_name: '기관',
  raw: 'DO_NOT_PERSIST_RAW', published_at: 'RSS_DATE_IS_NOT_VERIFIED' } };
test('private queue: replay-safe migration, URL uniqueness, immutable receipt, leases, stale ack and RLS', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    const sql = readFileSync(new URL('../supabase/migrations/202611110001_youth_ledger_bridge.sql', import.meta.url), 'utf8');
    await db.exec(sql); await db.exec(sql);
    await db.exec('set role service_role');
    const enqueue = value => db.query('select youth_ledger_enqueue($1::jsonb) as added', [JSON.stringify(value)]);
    assert.equal((await enqueue([entry, entry])).rows[0].added, 1);
    assert.equal((await enqueue([{ ...entry, payload: { ...entry.payload, title: '덮어쓸 제목' } }])).rows[0].added, 0);
    const stored = (await db.query('select * from youth_ledger_outbox')).rows[0];
    assert.equal(stored.payload.title, entry.payload.title);
    assert.equal(stored.payload.raw, undefined);
    assert.equal(stored.payload.published_at, undefined);
    const first = '11111111-1111-4111-8111-111111111111';
    const second = '22222222-2222-4222-8222-222222222222';
    assert.equal((await db.query('select * from youth_ledger_claim($1,30)', [first])).rows.length, 1);
    assert.equal((await db.query('select * from youth_ledger_claim($1,30)', [second])).rows.length, 0);
    await db.exec("update youth_ledger_outbox set lease_until=now()-interval '1 second'");
    assert.equal((await db.query('select * from youth_ledger_claim($1,30)', [second])).rows.length, 1);
    assert.equal((await db.query('select youth_ledger_ack($1,$2) as acked', [first, [stored.sheet_row]])).rows[0].acked, 0);
    assert.equal((await db.query('select youth_ledger_ack($1,$2) as acked', [second, [stored.sheet_row]])).rows[0].acked, 1);
    assert.equal((await db.query('select youth_ledger_status() as status')).rows[0].status.synced, 1);
    await assert.rejects(enqueue(null), /ledger_invalid_batch/);
    await assert.rejects(db.query('select youth_ledger_release($1,$2)', [first, 'private error body']), /ledger_invalid_error_code/);
    await db.exec('reset role; set role anon');
    await assert.rejects(db.exec('select * from youth_ledger_outbox'), /permission denied/);
    await assert.rejects(db.exec("select youth_ledger_enqueue('[]'::jsonb)"), /permission denied/);
    await db.exec('reset role; set role authenticated');
    await assert.rejects(db.exec('select youth_ledger_status()'), /permission denied/);
    await db.exec('reset role; grant select on youth_ledger_outbox to anon; set role anon');
    assert.equal((await db.query('select * from youth_ledger_outbox')).rows.length, 0);
  } finally { await db.close(); }
});

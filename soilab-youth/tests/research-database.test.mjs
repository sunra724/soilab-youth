import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL 마이그레이션: 검토 보존, 변경 시 비공개, 오래된 승인 차단, RLS', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    const migration = name => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
    const sql = migration('202609070001_youth_policy_briefings.sql') + '\n' + migration('202609070002_youth_policy_sources.sql');
    await db.exec(sql); await db.exec(sql); // Reapplying setup is safe.
    const id = 'nkis-' + 'a'.repeat(24);
    const h1 = '1'.repeat(64); const h2 = '2'.repeat(64);
    await db.query(`insert into youth_policy_sources (id,provider,external_id,title,publisher,url,scope,content_hash) values ($1,'nkis','R01','연구','연구원','https://www.nkis.re.kr/a','youth',$2)`, [id, h1]);
    assert.equal((await db.query('select review_status from youth_policy_sources')).rows[0].review_status, 'pending');
    await assert.rejects(db.exec("update youth_policy_sources set review_status='approved'"), /youth_source_approval_complete/);
    await db.exec("update youth_policy_sources set review_status='approved',summary='요약',application='적용',limitation='한계',review_scope='초록',topics=array['policy'],reviewed_at=now()");
    await db.query(`insert into youth_policy_sources (id,provider,external_id,title,publisher,url,scope,content_hash) values ($1,'nkis','R01','연구','연구원','https://www.nkis.re.kr/a','youth',$2) on conflict(id) do update set title=excluded.title,content_hash=excluded.content_hash,checked_at=now()`, [id, h1]);
    assert.equal((await db.query('select review_status from youth_policy_sources')).rows[0].review_status, 'approved');
    await db.query('update youth_policy_sources set content_hash=$1,raw_excerpt=$2', [h2, '새 초록']);
    const changed = (await db.query('select review_status,reviewed_at,summary from youth_policy_sources')).rows[0];
    assert.equal(changed.review_status, 'pending'); assert.equal(changed.reviewed_at, null); assert.equal(changed.summary, '요약');
    const stale = await db.query("update youth_policy_sources set review_status='approved',reviewed_at=now() where id=$1 and content_hash=$2 returning id", [id, h1]);
    assert.equal(stale.rows.length, 0);
    await db.exec('set role anon');
    await assert.rejects(db.exec('select * from youth_policy_sources'), /permission denied/);
    await assert.rejects(db.exec('select * from youth_source_sync_runs'), /permission denied/);
    await db.exec('reset role; grant select on youth_policy_sources to anon; set role anon');
    assert.equal((await db.query('select * from youth_policy_sources')).rows.length, 0); // RLS still closes access even if a grant is added.
    await db.exec('reset role');
    await db.exec("insert into youth_policy_briefings (briefing_date,title,summary,body_text,visibility) values ('2026-09-07','제목','요약','본문','public'),('2026-09-06','제목','요약','본문','internal'); set role anon");
    assert.equal((await db.query('select * from youth_policy_briefings')).rows.length, 1);
    await db.exec('reset role');
  } finally { await db.close(); }
});

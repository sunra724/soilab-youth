import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const source = readFileSync(new URL('../briefing/youth-policy-telegram.gs', import.meta.url), 'utf8');
function context() {
  const properties = new Map();
  const logs = [];
  const ctx = vm.createContext({ console, Set, Date, JSON, Object, String, Number, Error, encodeURIComponent,
    Logger: { log: value => logs.push(value) },
    PropertiesService: { getScriptProperties: () => ({ getProperties: () => Object.fromEntries(properties), getProperty: key => properties.get(key), setProperty: (key, value) => properties.set(key, value) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    Utilities: { formatDate: () => '2026-09-07', DigestAlgorithm: { SHA_256: 'sha256' }, computeDigest: (_, text) => createHash('sha256').update(text).digest(), base64EncodeWebSafe: bytes => Buffer.from(bytes).toString('base64url') },
  });
  vm.runInContext(source, ctx);
  Object.entries({ YOUTH_BRIEFING_API_URL: 'https://www.soilab-youth.kr/api/research/briefings', YOUTH_BRIEFING_INGEST_TOKEN: 't'.repeat(40), TELEGRAM_BOT_TOKEN: 'test', TELEGRAM_CHANNEL_ID: '@test_youth', ANTHROPIC_API_KEY: 'test' }).forEach(([k,v]) => properties.set(k,v));
  return { ctx, properties, logs };
}

test('승인한 최근 검토자료만 브리핑에 넣고 과거 발행연도를 보존한다', () => {
  const { ctx } = context();
  const item = { title: '과거 연구', url: 'https://www.nkis.re.kr/a', publisher: '연구원', tier: 'research', review_status: 'approved', reviewed_at: new Date(Date.now() - 1000).toISOString(), publication_year: 2021, published_at: null, excerpt: '검토 요약' };
  ctx.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify({ available: true, items: [item, { ...item, review_status: 'pending' }, { ...item, reviewed_at: '2020-01-01T00:00:00Z' }] }) }) };
  const rows = ctx.youthCatalogSources_(ctx.youthProperties_());
  assert.equal(rows.length, 1); assert.equal(rows[0].publication_year, 2021); assert.equal(rows[0].published_at, null);
  ctx.youthClaude_ = (_, system, data) => data.sources ? { ids: ['S1'] } : data.source ? { takeaway: '지원 체계 검토', check: '대상 연령' } : { signal: '기존 연구 검토', action: '지역과 비교' };
  const result = ctx.buildYouthBriefing_(ctx.youthProperties_(), { items: rows, failures: [] }, '2026-09-07');
  assert.match(result.body_text, /최근 검토자료 · 발행 2021 · 신규 발표 아님/);
});

test('청년·해외 고립 정책을 선별하고 일반 돌봄·투자 뉴스는 제외한다', () => {
  const { ctx } = context();
  for (const text of ['고립·은둔 청년 지원방안', '청년미래센터 운영', 'ひきこもり 支援', 'UK loneliness policy']) assert.equal(ctx.youthRelevant_(text), true);
  for (const text of ['노인 장기요양 확대', '주식 투자 정책', '청년 주택 청약']) assert.equal(ctx.youthRelevant_(text), false);
  assert.equal(ctx.youthSourceTier_('https://www.mohw.go.kr/a'), 'official');
  assert.equal(ctx.youthSourceTier_('https://mohw.go.kr.evil.example/a'), 'news');
  assert.equal(ctx.youthSourceTier_('https://news.google.com/rss/articles/id'), 'news');
});

test('신규 자료 없는 날에는 범위가 한정된 안내를 만들고 수집 실패를 표시한다', () => {
  const { ctx } = context();
  const draft = ctx.buildYouthBriefing_(ctx.youthProperties_(), { items: [], failures: ['일본 정책 동향'] }, '2026-09-07');
  assert.match(draft.body_text, /오늘 수집 범위/);
  assert.match(draft.body_text, /일본 정책 동향 조회 실패/);
  assert.equal(draft.sources.length, 0);
  assert.equal(draft.generator_model, null);
});

test('AI가 존재하지 않는 출처 ID나 URL을 만들면 발행을 중단한다', () => {
  const { ctx } = context();
  assert.throws(() => ctx.youthBoundText_('https://invented.example/fact', 100));
  ctx.youthClaude_ = () => ({ ids: ['S999'] });
  assert.throws(() => ctx.buildYouthBriefing_(ctx.youthProperties_(), { items: [{ title: '제목', url: 'https://example.com/a', publisher: '기관', tier: 'news' }], failures: [] }, '2026-09-07'), /ID/);
});

test('웹 저장 실패 시 Telegram은 호출하지 않는다', () => {
  const { ctx } = context();
  let sent = false;
  ctx.youthApi_ = (_, method) => { if (method === 'get') return { briefing: null }; throw new Error('DB unavailable'); };
  ctx.collectYouthSources_ = () => ({ items: [], failures: [] });
  ctx.youthTelegram_ = () => { sent = true; };
  assert.throws(() => ctx.sendYouthPolicyBriefing(), /DB unavailable/);
  assert.equal(sent, false);
});

test('발송 완료·발송 중·결과 불명 상태는 재전송하지 않는다', () => {
  for (const status of ['delivered', 'sending', 'uncertain']) {
    const { ctx } = context();
    let sent = false;
    ctx.youthApi_ = () => ({ briefing: { delivery_status: status } });
    ctx.youthTelegram_ = () => { sent = true; };
    ctx.sendYouthPolicyBriefing();
    assert.equal(sent, false);
  }
});

test('Telegram 응답이 불명확하면 uncertain 상태로 남기고 자동 재시도를 멈춘다', () => {
  const { ctx } = context();
  const actions = [];
  ctx.youthApi_ = (_, method, data) => {
    if (method === 'get') return { briefing: { delivery_status: 'pending', body_text: '저장된 본문', sources: [] } };
    actions.push(data.action);
    return { briefing: { body_text: '저장된 본문' } };
  };
  ctx.youthTelegram_ = () => { throw new Error('timeout'); };
  assert.throws(() => ctx.sendYouthPolicyBriefing(), /자동 재전송은 중지/);
  assert.deepEqual(actions, ['claim', 'uncertain']);
});

test('성공한 전송의 웹 상태 갱신 실패는 재발송을 일으키지 않고 메시지 ID를 보존한다', () => {
  const { ctx, properties } = context();
  let sends = 0;
  ctx.youthApi_ = (_, method, data) => {
    if (method === 'get') return { briefing: { delivery_status: 'pending', body_text: '원래 본문', sources: [{ title: '원래 출처' }] } };
    if (data.action === 'delivered') throw new Error('DB timeout');
    return { briefing: { body_text: '원래 본문' } };
  };
  ctx.youthTelegram_ = (_, method, payload) => {
    sends++; assert.equal(payload.text, '원래 본문');
    return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ok: true, result: { message_id: 42 } }) };
  };
  ctx.sendYouthPolicyBriefing();
  assert.equal(sends, 1);
  assert.equal(JSON.parse(properties.get('youth_last_delivery')).message_id, 42);
  assert.equal(JSON.parse(properties.get('youth_policy_seen_v1')).length, 1);
});

test('원자적 발송 선점 실패 시 메시지를 보내지 않는다', () => {
  const { ctx } = context();
  let sent = false;
  ctx.youthApi_ = (_, method) => {
    if (method === 'get') return { briefing: { delivery_status: 'pending' } };
    throw new Error('409 conflict');
  };
  ctx.youthTelegram_ = () => { sent = true; };
  assert.throws(() => ctx.sendYouthPolicyBriefing(), /409/);
  assert.equal(sent, false);
});

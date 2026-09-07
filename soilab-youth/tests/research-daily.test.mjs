import assert from 'node:assert/strict';
import test from 'node:test';
import { deliverDaily, prepareDailyDraft, collectDailyCandidates, koreaDate } from '../src/lib/research/daily.ts';

const props = { api: 'https://archive.test/api/research/briefings', ingest: 'a'.repeat(40), bot: 'test-bot', chat: '@youth_test', anthropic: 'fixture', model: 'fixture-model' };
const now = () => new Date('2026-09-07T00:00:00Z');
const draft = { briefing_date: '2026-09-07', title: '청년 정책 브리핑', summary: '요약', body_text: '검토할 내용', sources: [], generator_model: null };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status });

test('한국 날짜를 사용하고 기발송·전송 중·결과 불명 브리핑은 보내지 않는다', async () => {
  assert.equal(koreaDate(new Date('2026-09-06T23:00:00Z')), '2026-09-07');
  for (const status of ['delivered', 'sending', 'uncertain']) {
    let calls = 0;
    const result = await deliverDaily(props, { now, draft: async () => { throw new Error('must not draft'); }, fetcher: async () => { calls++; return json({ briefing: { delivery_status: status } }); } });
    assert.equal(result.status, 'skipped'); assert.equal(calls, 1);
  }
});

test('첫 저장 실패·동시 선점 실패 시 전송하지 않는다', async () => {
  for (const failure of ['save', 'claim']) {
    let sent = 0;
    const runtime = { now, draft: async () => draft, fetcher: async (url, init) => {
      if (String(url).includes('telegram')) { sent++; return json({ ok: true }); }
      if (init.method === 'GET') return json({ briefing: failure === 'claim' ? { delivery_status: 'pending' } : null, titles: [] });
      return json({}, failure === 'save' ? 503 : 409);
    } };
    if (failure === 'save') await assert.rejects(deliverDaily(props, runtime), /archive_unavailable/);
    else assert.equal((await deliverDaily(props, runtime)).status, 'skipped');
    assert.equal(sent, 0);
  }
});

test('Telegram 타임아웃은 uncertain으로, 성공 후 상태 저장 실패는 재발송 없이 기록한다', async () => {
  for (const failure of ['timeout', 'ack']) {
    const actions = []; let sends = 0;
    const runtime = { now, draft: async () => draft, fetcher: async (url, init) => {
      if (String(url).includes('telegram')) { sends++; if (failure === 'timeout') throw new Error('timeout'); return json({ ok: true, result: { message_id: 42 } }); }
      if (init.method === 'GET') return json({ briefing: { delivery_status: 'pending' } });
      const data = JSON.parse(init.body); actions.push(data.action);
      if (data.action === 'delivered') return json({}, 503);
      return json({ briefing: { body_text: draft.body_text } });
    } };
    if (failure === 'timeout') { await assert.rejects(deliverDaily(props, runtime), /uncertain/); assert.deepEqual(actions, ['claim', 'uncertain']); }
    else { const result = await deliverDaily(props, runtime); assert.equal(result.status, 'sent-status-unconfirmed'); assert.equal(result.message_id, 42); }
    assert.equal(sends, 1);
  }
});

test('과거 검토자료를 최신 정책으로 표시하지 않고 승인 안 된 자료를 제외한다', async () => {
  const item = { title: '청년 고립 연구', url: 'https://www.nkis.re.kr/a', publisher: '연구원', excerpt: '지원체계 검토', review_status: 'approved', tier: 'research', publication_year: 2021, published_at: null, reviewed_at: '2026-09-06T00:00:00Z', checked_at: now().toISOString() };
  const runtime = { now, draft: prepareDailyDraft, fetcher: async (url, init) => {
    if (String(url).includes('/sources?')) return json({ available: true, items: [item, { ...item, title: '미승인', review_status: 'pending' }] });
    if (String(url).includes('anthropic')) {
      const input = JSON.parse(JSON.parse(init.body).messages[0].content);
      const output = input.sources ? { ids: ['S1'] } : input.source ? { takeaway: '지원체계 살펴보기', check: '연령 범위' } : { signal: '기존 연구의 검토', action: '소이랩의 현장과 비교' };
      return json({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(output) }] });
    }
    return new Response('<rss><channel></channel></rss>');
  } };
  const collected = await collectDailyCandidates(props, [], runtime);
  assert.equal(collected.items.length, 1);
  assert.equal((await collectDailyCandidates(props, [item.title], runtime)).items.length, 0);
  const result = await prepareDailyDraft(props, [], runtime);
  assert.match(result.body_text, /발행 2021 · 신규 발표 아님/);
  assert.equal(result.sources.length, 1);
});

test('전 수집원 장애에서는 발행을 중단하고 빈 정상 응답과 구분한다', async () => {
  await assert.rejects(collectDailyCandidates(props, [], { now, draft: prepareDailyDraft, fetcher: async () => json({}, 503) }), /all_sources_failed/);
});

test('선택 순서가 바뀌어도 각각의 단일 자료에서 생성한 요약을 원래 제목·URL과 묶는다', async () => {
  const reviewed = title => ({ title, url: 'https://www.nkis.re.kr/' + encodeURIComponent(title), publisher: '연구원', excerpt: title + '의 검토 내용', review_status: 'approved', tier: 'research', publication_year: 2025, published_at: null, reviewed_at: '2026-09-06T00:00:00Z', checked_at: now().toISOString() });
  const calls = [];
  const runtime = { now, draft: prepareDailyDraft, fetcher: async (url, init) => {
    if (String(url).includes('/sources?')) return json({ available: true, items: [reviewed('가족지원'), reviewed('청년발굴')] });
    if (String(url).includes('anthropic')) {
      const input = JSON.parse(JSON.parse(init.body).messages[0].content);
      let output;
      if (input.sources) output = { ids: ['S2', 'S1'] };
      else if (input.source) { calls.push(input); output = { takeaway: input.source.title + '만 요약', check: input.source.title + '만 확인' }; }
      else output = { signal: '두 연구의 검토', action: '적용 조건 확인' };
      return json({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(output) }] });
    }
    return new Response('<rss><channel/></rss>');
  } };
  const result = await prepareDailyDraft(props, [], runtime);
  assert.equal(calls.length, 2); calls.forEach(call => assert.deepEqual(Object.keys(call), ['source']));
  const blocks = result.body_text.split(/\n\n/);
  assert.match(blocks.find(block => block.startsWith('1.')), /청년발굴만 요약/);
  assert.match(blocks.find(block => block.startsWith('2.')), /가족지원만 요약/);
  assert.deepEqual(result.sources.map(source => source.title), ['청년발굴', '가족지원']);
});

test('Google RSS 설명에 섞인 다른 기사 내용은 개별 기사 발췌로 사용하지 않는다', async () => {
  const runtime = { now, draft: prepareDailyDraft, fetcher: async url => {
    if (String(url).includes('/sources?')) return json({ available: true, items: [] });
    if (String(url).includes('news.google.com')) return new Response('<rss><channel><item><title>청년 고립 지원 연구</title><link>https://news.google.com/rss/articles/a</link><pubDate>Mon, 07 Sep 2026 00:00:00 GMT</pubDate><description>다른 기관과 다른 사건의 수치 999명</description></item></channel></rss>');
    return new Response('<rss><channel/></rss>');
  } };
  const result = await collectDailyCandidates(props, [], runtime);
  assert.equal(result.items[0].excerpt, '청년 고립 지원 연구');
  assert.equal(result.items[0].feed_kind, 'headline_only');
});

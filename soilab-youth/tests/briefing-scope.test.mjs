import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { briefingRelevant, collectDailyCandidates } from '../src/lib/research/daily.ts';
import { readBriefingSource, youthPolicyScope } from '../src/lib/research/briefing-evidence.ts';
import { composeEvidenceBriefing } from '../src/lib/research/briefing-editor.ts';
import { YOUTH_POLICY_DOMESTIC_FEEDS } from '../src/lib/research/briefing-scope.ts';

const script = vm.createContext({});
vm.runInContext(readFileSync(new URL('../briefing/youth-policy-telegram.gs', import.meta.url), 'utf8'), script);

test('위기청년과 네 지원분야의 표기 차이를 수집·원문 확인·대체 실행기에서 일관되게 처리한다', () => {
  const included = [
    '위기청년 지원체계 개편', '위기 청년 실태조사', '위기아동·청년 지원', '위기아동 및 청년 지원',
    '고립·은둔 청년 회복', '고립 청년 지역 지원', '히키코모리 지원', '청년 미래 센터 운영',
    '가족 돌봄 청년 지원', '가족돌봄청소년 연구', '영케어러 돌봄 부담',
    '자립준비청년 주거 지원', '자립 준비 청년 진로 상담', '보호종료아동 지원', '자립지원전담기관 운영',
    '탈가정청년 지원', '가정 밖 청년 자립', '가정 밖 청소년 지원', '쉼터 퇴소 청년 지원', '청소년자립지원관 개소',
  ];
  const excluded = ['노인 장기요양 확대', '주식 투자 정책', '청년 주택 청약', '청년 창업 지원', '중년 가족돌봄 지원', '기업 경영 위기 대응'];
  for (const [rows, expected] of [[included, true], [excluded, false]]) {
    for (const title of rows) {
      assert.equal(briefingRelevant(title), expected, `수집: ${title}`);
      assert.equal(youthPolicyScope(title), expected, `원문: ${title}`);
      assert.equal(script.youthRelevant_(title), expected, `대체 실행기: ${title}`);
    }
  }
});

test('분야별 독립 검색에서 모은 기사가 원문 확인에서도 누락되지 않는다', async () => {
  const titles = [
    '대구 고립청년 이웃 관계 회복 프로그램', '서울 위기청년 통합지원 실태조사',
    '인천 영케어러 가족돌봄 휴식 지원', '부산 자립준비청년 주거 정착 상담',
    '광주 가정 밖 청소년 쉼터 퇴소 자립 경로',
  ];
  const now = () => new Date('2026-11-13T00:00:00Z');
  const visited = [];
  const runtime = { now, resolveHost: async () => ['93.184.216.34'], fetcher: async value => {
    const url = new URL(value);
    if (url.pathname.endsWith('/sources')) return Response.json({ available: true, items: [] });
    const index = YOUTH_POLICY_DOMESTIC_FEEDS.findIndex(feed => url.searchParams.get('q') === feed.query + ' when:3d');
    if (index >= 0) {
      visited.push(index);
      return new Response(`<rss><channel><item><title>${titles[index]}</title><link>https://www.mohw.go.kr/fixture/${index}</link><pubDate>${now().toUTCString()}</pubDate></item></channel></rss>`);
    }
    const article = /^\/fixture\/(\d)$/u.exec(url.pathname);
    if (article) {
      const title = titles[Number(article[1])];
      return new Response(`<h1>${title}</h1><article>${(title + '에 관한 지원대상과 운영 조건을 검토하는 자료입니다. ').repeat(12)}</article>`, { headers: { 'content-type': 'text/html' } });
    }
    return new Response('<rss><channel/></rss>');
  } };
  const collected = await collectDailyCandidates({ api: 'https://archive.test/api/research/briefings' }, [], runtime);
  assert.deepEqual(visited.sort(), [0, 1, 2, 3, 4]);
  assert.equal(collected.items.length, titles.length);
  for (const candidate of collected.items) {
    assert.equal((await readBriefingSource(candidate, runtime)).evidence_scope, 'article_body');
  }
  const fallbackQueries = script.youthFeeds_().filter(feed => new URL(feed.url).searchParams.get('hl') === 'ko')
    .map(feed => new URL(feed.url).searchParams.get('q'));
  assert.deepEqual(Array.from(fallbackQueries), YOUTH_POLICY_DOMESTIC_FEEDS.map(feed => feed.query + ' when:3d'));
});

test('두 실행기 모두 확장된 범위를 브리핑 머리말에 표시한다', () => {
  const briefing = composeEvidenceBriefing('2026-11-13', [], 'fixture');
  const fallback = script.buildYouthBriefing_({ YOUTH_BRIEFING_API_URL: 'https://archive.test/api/research/briefings' }, { items: [], failures: [] }, '2026-11-13');
  for (const body of [briefing.body_text, fallback.body_text]) {
    assert.match(body, /^소이랩 위기청년 정책 브리핑/u);
    assert.match(body, /고립·은둔 · 가족돌봄 · 자립준비 · 탈가정·가정 밖 청년/u);
  }
});

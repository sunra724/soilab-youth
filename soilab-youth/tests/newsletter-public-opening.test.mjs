import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessNewsPolicy,
  hasCoreKeyword,
  isPortalOrAggregatorUrl,
} from '../src/config/keywords.ts';
import { buildEmailHtml, buildEmailText } from '../src/lib/emailTemplate.ts';
import {
  createConfirmationToken,
  verifyConfirmationToken,
} from '../src/lib/newsletterToken.ts';
import {
  canonicalPublisherUrl,
  parseGoogleNewsBatchResponse,
} from '../src/lib/googleNews.ts';
import {
  collapseRelatedNews,
  isSameNewsStory,
} from '../src/lib/newsletterDedupe.ts';

const originalSecret = process.env.NEWSLETTER_SUBSCRIPTION_SECRET;

test.after(() => {
  if (originalSecret === undefined) {
    delete process.env.NEWSLETTER_SUBSCRIPTION_SECRET;
  } else {
    process.env.NEWSLETTER_SUBSCRIPTION_SECRET = originalSecret;
  }
});

test('핵심 키워드와 포털 링크를 구분한다', () => {
  assert.equal(hasCoreKeyword('쉬었음 청년의 사회 복귀를 돕는다'), true);
  assert.equal(hasCoreKeyword('일반 청년 취업 박람회'), false);
  assert.equal(isPortalOrAggregatorUrl('https://v.daum.net/v/123'), true);
  assert.equal(isPortalOrAggregatorUrl('https://www.yna.co.kr/view/123'), false);
});

test('영상, 광범위 제외 주제, 포털 재배포를 발송 후보에서 제외한다', () => {
  assert.equal(
    assessNewsPolicy({
      title: '[영상] 은둔 청년의 하루',
      source: 'KBS 뉴스',
      url: 'https://news.kbs.co.kr/news/view.do?ncd=1',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '자립준비청년 후원 협약 체결',
      source: '연합뉴스',
      url: 'https://www.yna.co.kr/view/AKR1',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '자립준비청년 지원을 위한 기관 간 MOU',
      source: '연합뉴스',
      url: 'https://www.yna.co.kr/view/AKR1-1',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '은둔 청년의 삶을 다룬 신작 소설',
      source: '한국일보',
      url: 'https://www.hankookilbo.com/News/Read/2',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '쉬었음 청년이 된 프로야구 주전 선수',
      source: '머니투데이',
      url: 'https://www.mt.co.kr/sports/1',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '자립준비청년 위한 성금 기탁',
      source: '매일신문',
      url: 'https://www.imaeil.com/page/view/1',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '고립청년 지원사업 확대',
      source: '연합뉴스',
      url: 'https://www.yna.co.kr/view/RPR20260708006500353',
      requirePublisher: true,
    }).reason,
    '언론사 도메인 내 보도자료',
  );
  assert.equal(
    assessNewsPolicy({
      title: '경계선지능 청년 자립 지원 확대',
      source: '뉴시스',
      url: 'https://v.daum.net/v/1',
      requirePublisher: true,
    }).status,
    'rejected',
  );
  assert.equal(
    assessNewsPolicy({
      title: '고립 청년 지원 확대',
      source: 'KBS 뉴스',
      url: 'https://www.newsis.com/view/1',
      requirePublisher: true,
    }).reason,
    '출처와 원문 도메인 불일치',
  );
});

test('민감 보도는 검수 대기로 보내고 구체적 사건 제목은 제외한다', () => {
  assert.equal(
    assessNewsPolicy({
      title: '고립 청년 자살 예방 정책 토론회',
      source: '연합뉴스',
      url: 'https://www.yna.co.kr/view/AKR2',
      requirePublisher: true,
    }).status,
    'review',
  );
  assert.equal(
    assessNewsPolicy({
      title: '은둔 청년 투신 사건',
      source: '연합뉴스',
      url: 'https://www.yna.co.kr/view/AKR3',
      requirePublisher: true,
    }).status,
    'rejected',
  );
});

test('등록 언론사의 핵심 키워드 보도는 발송할 수 있다', () => {
  const result = assessNewsPolicy({
    title: '구직단념 청년 다시 일상으로…지원 현장 확대',
    source: '한국일보',
    url: 'https://www.hankookilbo.com/News/Read/1',
    requirePublisher: true,
  });
  assert.deepEqual(result, { status: 'accepted', reason: '공개 기준 충족' });
});

test('공개 메일에는 기사 요약이나 본문을 넣지 않는다', () => {
  const item = {
    title: '쉬었음 청년의 회복 지원 현장',
    source: '한겨레',
    url: 'https://www.hani.co.kr/arti/society/1.html',
    publishedAt: '2026-07-29',
    category: '고립은둔',
    summary: '메일에 절대로 포함되면 안 되는 임의 요약문',
  };
  const html = buildEmailHtml({ issueLabel: '2026년 7월 29일', items: [item] });
  const text = buildEmailText({ issueLabel: '2026년 7월 29일', items: [item] });

  assert.equal(html.includes(item.summary), false);
  assert.equal(text.includes(item.summary), false);
  assert.match(html, /기사의 저작권은 각 언론사에 있으며/u);
  assert.match(text, /자살예방상담전화 109/u);
  assert.match(html, /정신건강위기 상담전화 1577-0199/u);
  assert.match(text, /소이랩은 전화 상담을 운영하지 않습니다/u);
  assert.equal(html.includes('053-941-9003'), false);
  assert.equal(text.includes('053-941-9003'), false);
});

test('구독 확인 토큰은 만료와 변조를 검증한다', () => {
  process.env.NEWSLETTER_SUBSCRIPTION_SECRET = 'test-secret-at-least-thirty-two-characters';
  const token = createConfirmationToken('Person@Example.com', 1_000, 10_000);

  assert.equal(verifyConfirmationToken(token, 2_000)?.email, 'person@example.com');
  assert.equal(verifyConfirmationToken(token, 20_000), null);
  assert.equal(verifyConfirmationToken(`${token}x`, 2_000), null);
});

test('Google News 배치 응답에서 언론사 원문 URL을 추출한다', () => {
  const payload = `)]}'\n\n${JSON.stringify([
    ['wrb.fr', 'Fbv4je', JSON.stringify(['garturlres', 'https://www.yna.co.kr/view/AKR4', 1]), null, null, null, 'generic'],
    ['di', 12],
  ])}`;
  assert.deepEqual(
    parseGoogleNewsBatchResponse(payload),
    ['https://www.yna.co.kr/view/AKR4'],
  );
});

test('언론사 원문 URL에서 공유 추적값만 제거한다', () => {
  assert.equal(
    canonicalPublisherUrl(
      'https://www.segye.com/newsView/123?OutUrl=google&utm_source=news#top',
    ),
    'https://www.segye.com/newsView/123',
  );
  assert.equal(
    canonicalPublisherUrl(
      'https://news.kbs.co.kr/news/view.do?ncd=123',
    ),
    'https://news.kbs.co.kr/news/view.do?ncd=123',
  );
});

test('같은 사건을 다룬 언론사별 기사는 한 건으로 묶는다', () => {
  const items = [
    {
      title: '서울 청년 마음건강 지원사업, 심야노동청년 우선 선발한다',
      publishedAt: '2026-07-16',
    },
    {
      title: '서울 청년 마음건강 상담 지원…심야노동자 우선 선발',
      publishedAt: '2026-07-16',
    },
    {
      title: '서울시, 청년 마음건강 지원 3차 모집…심야노동자 우선',
      publishedAt: '2026-07-16',
    },
    {
      title: '광주 동구, 고립 청년 예방을 위한 새 지원 체계 가동',
      publishedAt: '2026-07-29',
    },
  ];

  assert.equal(isSameNewsStory(items[0], items[1]), true);
  assert.equal(collapseRelatedNews(items).length, 2);
});

test('표현 길이가 달라도 핵심 고유어가 포함되면 같은 사건으로 묶는다', () => {
  const items = [
    {
      title: '자립준비청년, 전문 재무설계사 상담 받는다…경제적 자립 지원',
      publishedAt: '2026-07-14',
    },
    {
      title: '자립준비청년, 전문 재무설계사 상담받는다…28일까지 접수',
      publishedAt: '2026-07-14',
    },
  ];
  assert.equal(isSameNewsStory(items[0], items[1]), true);
  assert.equal(collapseRelatedNews(items).length, 1);
});

test('가족·부모 표현이 다른 같은 교육 보도도 하나로 묶는다', () => {
  const items = [
    {
      title: '고립·은둔청년과의 소통법은…서울시, 가족 대상 심화교육',
      publishedAt: '2026-07-19',
    },
    {
      title: '고립·은둔청년 회복, 부모가 먼저…서울시 심화교육 참가자 모집',
      publishedAt: '2026-07-19',
    },
  ];
  assert.equal(isSameNewsStory(items[0], items[1]), true);
});

test('같은 마음건강 모집의 인원·표현 차이도 중복으로 판정한다', () => {
  const items = [
    {
      title: '서울시, 청년 마음건강 지원 3차 모집…심야노동청년 우선 선발',
      publishedAt: '2026-07-16',
    },
    {
      title: '심야노동청년 먼저 뽑는다…서울시, 청년 마음건강 지원 2500명 모집',
      publishedAt: '2026-07-16',
    },
  ];
  assert.equal(isSameNewsStory(items[0], items[1]), true);
});

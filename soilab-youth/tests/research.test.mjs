import assert from 'node:assert/strict';
import test from 'node:test';
import { authorized, briefingIngestToken, parseBriefing, parseDelivery, validDate, publicUrl, telegramChannelUrl } from '../src/lib/research/core.ts';
import { filterEvidence } from '../src/data/research.ts';

const input = () => ({ briefing_date: '2026-09-07', title: '청년 정책 브리핑', summary: '수집 범위에서 확인한 자료', body_text: '본문 <script>도 문자열로 저장합니다.', sources: [{ title: '지원방안', url: 'https://www.mohw.go.kr/board.es?list_no=1', publisher: '보건복지부', tier: 'official', checked_at: '2026-09-07T00:00:00Z' }], generator_model: null });

test('브리핑 토큰은 공통 이름을 우선하고 이전 청년 전용 이름도 호환한다', () => {
  const primary = 'p'.repeat(64); const legacy = 'l'.repeat(64);
  assert.equal(briefingIngestToken({ BRIEFING_INGEST_TOKEN: primary, YOUTH_BRIEFING_INGEST_TOKEN: legacy }), primary);
  assert.equal(briefingIngestToken({ YOUTH_BRIEFING_INGEST_TOKEN: legacy }), legacy);
  assert.equal(briefingIngestToken({ BRIEFING_INGEST_TOKEN: '' }), undefined);
  assert.equal(authorized('Bearer ' + legacy, briefingIngestToken({ BRIEFING_INGEST_TOKEN: primary, YOUTH_BRIEFING_INGEST_TOKEN: legacy })), false);
  assert.equal(authorized('Bearer short', briefingIngestToken({ BRIEFING_INGEST_TOKEN: 'short' })), false);
});

test('수집 API 인증은 누락·짧은 토큰·다른 값·접두사 오류를 거부한다', () => {
  const token = 'a'.repeat(40);
  assert.equal(authorized(`Bearer ${token}`, token), true);
  assert.equal(authorized(`Bearer ${'b'.repeat(40)}`, token), false);
  assert.equal(authorized(`Bearer ${token}`), false);
  assert.equal(authorized('Bearer short', 'short'), false);
  assert.equal(authorized(token, token), false);
  assert.equal(authorized('Bearer existing-cron', 'existing-cron', 1), true);
  assert.equal(authorized('Bearer ', '', 1), false);
});

test('날짜는 실제 달력의 날짜만 허용한다', () => {
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-13-01'), false);
  assert.equal(validDate('2026-09-07&select=*'), false);
});

test('원문 URL은 실행 URL과 인증정보가 들어간 URL을 거부한다', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,a', 'https://user:password@example.com/a', 'http://127.0.0.1/a']) assert.equal(publicUrl(url), null);
  assert.equal(publicUrl('https://www.mohw.go.kr/a'), 'https://www.mohw.go.kr/a');
});

test('발행문은 길이와 출처 메타데이터를 검증하고 클라이언트가 보낸 발송 상태를 버린다', () => {
  const parsed = parseBriefing({ ...input(), delivery_status: 'delivered', visibility: 'public' });
  assert.equal('delivery_status' in parsed, false);
  assert.equal(parsed.sources.length, 1);
  assert.throws(() => parseBriefing({ ...input(), body_text: 'a'.repeat(3501) }));
  assert.throws(() => parseBriefing({ ...input(), sources: [{ ...input().sources[0], tier: 'verified' }] }));
  assert.throws(() => parseBriefing({ ...input(), sources: [{ ...input().sources[0], url: 'javascript:alert(1)' }] }));
  assert.throws(() => parseBriefing({ ...input(), sources: [{ ...input().sources[0], checked_at: 'unknown' }] }));
});

test('전송 성공 기록은 유효한 Telegram 메시지 ID를 요구한다', () => {
  assert.throws(() => parseDelivery({ briefing_date: '2026-09-07', action: 'delivered' }));
  assert.throws(() => parseDelivery({ briefing_date: '2026-09-07', action: 'pending' }));
  assert.equal(parseDelivery({ briefing_date: '2026-09-07', action: 'delivered', message_id: 12 }).message_id, 12);
});

test('검색어·유형·주제 필터를 함께 적용한다', () => {
  const items = filterEvidence('일본', '실무 지침', 'family');
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'japan-support-handbook');
  assert.equal(filterEvidence('일본', '법령', 'work').length, 0);
});

test('채널 링크는 실제 t.me 공개 채널 형식만 표시한다', () => {
  assert.equal(telegramChannelUrl('https://t.me/youth_policy'), 'https://t.me/youth_policy');
  assert.equal(telegramChannelUrl('https://t.me.evil.test/youth_policy'), null);
  assert.equal(telegramChannelUrl('https://t.me/youth_policy?token=secret'), null);
  assert.equal(telegramChannelUrl(''), null);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFallbackEncouragement,
  getKoreanDate,
  getKoreanTime,
  hasSafetySignal,
  sanitizeShortText,
} from '../src/lib/morning/core.ts';

test('일반적인 작은 약속에는 안전 신호를 만들지 않는다', () => {
  assert.equal(hasSafetySignal('물 한 잔 마시기'), false);
  assert.equal(hasSafetySignal('오늘은 조금 쉬고 싶어요'), false);
});

test('위험 가능 표현은 일반 응원 대신 안전 안내로 분기한다', () => {
  assert.equal(hasSafetySignal('죽고 싶다는 생각이 들어요'), true);
  assert.equal(hasSafetySignal('스스로 해치고 싶어요'), true);
  assert.equal(hasSafetySignal('그냥 사라지고 싶어요'), true);
});

test('빠른 약속은 사전에 검토한 고정 응원을 반환한다', () => {
  assert.equal(
    createFallbackEncouragement('물 한 잔 마시기'),
    '물 한 잔을 고른 마음이 오늘의 좋은 시작이에요. 천천히 한 모금이면 충분해요.',
  );
});

test('직접 적은 약속도 두 문장 이내의 응원을 반환한다', () => {
  const response = createFallbackEncouragement('책상 앞에 1분 앉기');
  assert.match(response, /책상 앞에 1분 앉기/);
  assert.ok(response.split(/[.!?]\s*/).filter(Boolean).length <= 2);
});

test('입력값은 제어문자와 과도한 공백을 제거하고 길이를 제한한다', () => {
  assert.equal(sanitizeShortText('  물\u0000  한 잔  ', 20), '물 한 잔');
  assert.equal(sanitizeShortText('가나다라마바사', 4), '가나다라');
});

test('한국 날짜는 Asia/Seoul 기준으로 계산한다', () => {
  assert.equal(getKoreanDate(new Date('2026-07-26T16:30:00.000Z')), '2026-07-27');
  assert.equal(getKoreanTime(new Date('2026-07-26T23:10:00.000Z')), '08:10');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTelegramMessages,
  escapeTelegramHtml,
  resolveTelegramChannelUrl,
  resolveTelegramTarget,
} from '../src/lib/telegram.ts';

test('텔레그램 HTML 특수문자를 이스케이프하고 안전하지 않은 링크를 제외한다', () => {
  const [message] = buildTelegramMessages({
    issueLabel: '2026년 8월 15일 & 오늘',
    items: [{
      title: '<script>alert("x")</script> 고립청년 소식',
      url: 'javascript:alert(1)',
      source: '온통청년 & 청년미래센터',
      summary: '상담 <신청> & 회복지원',
      category: '지원 정보',
    }],
  });

  assert.equal(escapeTelegramHtml('<>&"'), '&lt;&gt;&amp;&quot;');
  assert.match(message, /2026년 8월 15일 &amp; 오늘/u);
  assert.match(message, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/u);
  assert.match(message, /온통청년 &amp; 청년미래센터/u);
  assert.match(message, /#지원정보/u);
  assert.doesNotMatch(message, /javascript:/u);
  assert.doesNotMatch(message, /<script>/u);
});

test('http 링크를 원문 보기 링크로 넣는다', () => {
  const [message] = buildTelegramMessages({
    issueLabel: '2026년 8월 15일',
    items: [{
      title: '청년 지원 프로그램',
      url: 'https://example.com/news?a=1&b=2',
      source: '청년재단',
      summary: '',
      category: '청년지원',
    }],
  });

  assert.match(message, /href="https:\/\/example\.com\/news\?a=1&amp;b=2"/u);
  assert.match(message, />원문 보기<\/a>/u);
});

test('긴 뉴스 목록을 기사 경계에서 여러 메시지로 나눈다', () => {
  const items = Array.from({ length: 30 }, (_, index) => ({
    title: `기사-${index + 1} ${'가'.repeat(80)}`,
    url: `https://example.com/news/${index + 1}`,
    source: '테스트 출처',
    summary: `요약-${index + 1} ${'나'.repeat(180)}`,
    category: '고립은둔',
  }));
  const messages = buildTelegramMessages({ issueLabel: '2026년 8월 15일', items });

  assert.ok(messages.length > 1);
  messages.forEach((message, index) => {
    assert.ok(message.length <= 3_500);
    assert.match(message, new RegExp(`\\(${index + 1}\\/${messages.length}\\)`, 'u'));
  });
  items.forEach((_, index) => {
    const matches = messages.join('\n').match(new RegExp(`기사-${index + 1}(?!\\d)`, 'gu')) ?? [];
    assert.equal(matches.length, 1);
  });
});

test('빈 뉴스 목록은 메시지를 만들지 않는다', () => {
  assert.deepEqual(buildTelegramMessages({ issueLabel: '2026년 8월 15일', items: [] }), []);
});

test('테스트 발송은 운영 채널로 대체하지 않는다', () => {
  const target = resolveTelegramTarget(true, {
    TELEGRAM_ENABLED: 'true',
    TELEGRAM_BOT_TOKEN: 'test-token',
    TELEGRAM_CHAT_ID: '@production-channel',
  });

  assert.deepEqual(target, { enabled: false, reason: 'test-chat-not-configured' });
});

test('명시적으로 활성화하지 않으면 텔레그램 발송을 건너뛴다', () => {
  assert.deepEqual(
    resolveTelegramTarget(false, {
      TELEGRAM_BOT_TOKEN: 'test-token',
      TELEGRAM_CHAT_ID: '@production-channel',
    }),
    { enabled: false, reason: 'disabled' },
  );
});

test('공개 채널 아이디로 안전한 텔레그램 구독 링크를 만든다', () => {
  assert.equal(
    resolveTelegramChannelUrl({ TELEGRAM_CHAT_ID: '@dasibom_news' }),
    'https://t.me/dasibom_news',
  );
  assert.equal(
    resolveTelegramChannelUrl({ TELEGRAM_CHANNEL_URL: 'javascript:alert(1)' }),
    null,
  );
});

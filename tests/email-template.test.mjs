import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEmailHtml } from '../src/lib/emailTemplate.ts';

test('지원정보를 별도 섹션으로 표시하고 외부 텍스트를 HTML 이스케이프한다', () => {
  const html = buildEmailHtml({
    issueLabel: '2026년 8월 15일',
    items: [
      {
        title: '<script>alert(1)</script> 고립청년 프로그램',
        url: 'javascript:alert(1)',
        source: '온통청년 & 청년미래센터',
        summary: '신청기간: 2026.08.01 ~ 2026.09.30',
        category: '지원정보',
      },
    ],
  });

  assert.match(html, /#지원정보/u);
  assert.match(html, /뉴스와 지원 프로그램/u);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/u);
  assert.match(html, /온통청년 &amp; 청년미래센터/u);
  assert.match(html, /href="#"/u);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/u);
});

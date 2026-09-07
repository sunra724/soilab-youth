import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { pageMetadata } from '../src/lib/metadata.ts';

test('페이지 메타데이터는 자기 canonical과 완전한 OG 필드를 만든다', () => {
  const metadata = pageMetadata({
    path: '/newsletter',
    title: '다시봄 뉴스클리핑',
    description: '공개 뉴스클리핑 설명',
    siteName: '다시봄 뉴스클리핑',
    image: '/newsletter/opengraph-image',
  });

  assert.equal(metadata.alternates?.canonical, '/newsletter');
  assert.equal(metadata.openGraph?.url, '/newsletter');
  assert.equal(metadata.openGraph?.type, 'website');
  assert.equal(metadata.openGraph?.locale, 'ko_KR');
  assert.equal(metadata.openGraph?.siteName, '다시봄 뉴스클리핑');
  assert.equal(metadata.twitter?.card, 'summary_large_image');
  assert.deepEqual(metadata.openGraph?.images, [{
    url: '/newsletter/opengraph-image',
    width: 1200,
    height: 630,
    alt: '다시봄 뉴스클리핑',
  }]);
});

test('기사 메타데이터는 article 발행일과 큰 공유 이미지를 유지한다', () => {
  const metadata = pageMetadata({
    path: '/newsletter/2026-07-29',
    title: '2026년 7월 29일 다시봄 뉴스클리핑',
    description: '기사 5건',
    type: 'article',
    image: '/newsletter/opengraph-image',
    publishedTime: '2026-07-29T00:00:00+09:00',
  });

  assert.equal(metadata.openGraph?.type, 'article');
  assert.equal(
    metadata.openGraph?.type === 'article'
      ? metadata.openGraph.publishedTime
      : undefined,
    '2026-07-29T00:00:00+09:00',
  );
  assert.equal(metadata.twitter?.card, 'summary_large_image');
});

test('뉴스레터는 searchParams 없이 정적 첫 화면을 만들고 GA에서 쿼리를 제거한다', async () => {
  const [newsletterPage, rootLayout, unsubscribePage] = await Promise.all([
    readFile(new URL('../src/app/newsletter/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/unsubscribe/page.tsx', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(newsletterPage, /\bsearchParams\b/u);
  assert.match(rootLayout, /page_location:\s*location\.origin \+ location\.pathname/u);
  assert.match(unsubscribePage, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/u);
  assert.match(unsubscribePage, /referrer:\s*'no-referrer'/u);
});

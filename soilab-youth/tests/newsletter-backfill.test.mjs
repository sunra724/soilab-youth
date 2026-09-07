import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  addIsoDays,
  enumerateHistoricalDates,
  historicalGoogleNewsRssUrl,
  kstDateKey,
} from '../src/lib/newsletterBackfillDate.ts';
import {
  extractPublisherArticleMetadata,
  isExcludedPublisherSection,
} from '../src/lib/publisherArticleMetadata.ts';

test('과거 날짜 범위를 날짜별로 정확히 펼친다', () => {
  assert.deepEqual(
    enumerateHistoricalDates(
      '2026-07-01',
      '2026-07-03',
      '2026-07-29',
    ),
    ['2026-07-01', '2026-07-02', '2026-07-03'],
  );
  assert.equal(addIsoDays('2026-07-31', 1), '2026-08-01');
});

test('오늘 이후와 31일 초과 범위는 백필하지 않는다', () => {
  assert.throws(
    () => enumerateHistoricalDates(
      '2026-07-01',
      '2026-07-29',
      '2026-07-29',
    ),
    /오늘보다 이전/u,
  );
  assert.throws(
    () => enumerateHistoricalDates(
      '2026-06-01',
      '2026-07-02',
      '2026-07-29',
    ),
    /최대 31일/u,
  );
});

test('Google News 검색식은 하루 범위를 사용하고 KST 날짜를 재검증한다', () => {
  const url = new URL(
    historicalGoogleNewsRssUrl('고립 청년', '2026-07-01'),
  );
  const query = url.searchParams.get('q') ?? '';
  assert.match(query, /after:2026-07-01/u);
  assert.match(query, /before:2026-07-02/u);
  assert.doesNotMatch(query, /when:/u);
  assert.equal(kstDateKey('2026-07-01T14:59:59Z'), '2026-07-01');
  assert.equal(kstDateKey('2026-07-01T15:00:00Z'), '2026-07-02');
});

test('백필 Route Handler는 메일 모듈 없이 아카이브 전용으로 동작한다', async () => {
  const source = await readFile(
    new URL(
      '../src/app/api/newsletter/backfill/route.ts',
      import.meta.url,
    ),
    'utf8',
  );
  const implementation = await readFile(
    new URL('../src/lib/newsletterBackfill.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(
    `${source}\n${implementation}`,
    /\bResend\b|sendMail|buildEmail|listNewsletterRecipients/u,
  );
  assert.match(source, /archiveOnly:\s*true/u);
  assert.match(implementation, /emailSent:\s*false/u);
  assert.match(source, /CRON_SECRET/u);
});

test('언론사 원문의 발행일과 문화·스포츠 섹션을 추출한다', () => {
  const metadata = extractPublisherArticleMetadata(`
    <meta property="article:section" content="문화"/>
    <meta property="article:published_time" content="2026-07-07T04:30:00+09:00"/>
    <script type="application/ld+json">
      {"articleSection":"책","datePublished":"2026-07-07T04:30:00+09:00"}
    </script>
  `);
  assert.equal(metadata.publishedTime, '2026-07-07T04:30:00+09:00');
  assert.deepEqual(metadata.sections, ['문화', '책']);
  assert.equal(isExcludedPublisherSection(metadata.sections), true);
  assert.equal(isExcludedPublisherSection(['사회', '보건·복지']), false);
});

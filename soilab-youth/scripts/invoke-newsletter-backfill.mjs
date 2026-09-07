function argument(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? '';
}

const positional = process.argv.slice(2).filter((value) => !value.startsWith('--'));
const from = argument('from') || positional[0] || '';
const to = argument('to') || positional[1] || '';
const baseUrl = argument('base-url') || 'https://www.soilab-youth.kr';
const publish = process.argv.includes('--publish') || positional.includes('publish');
const secret = process.env.CRON_SECRET;

if (!from || !to) {
  throw new Error('--from=YYYY-MM-DD와 --to=YYYY-MM-DD를 지정해 주세요.');
}
if (!secret) {
  throw new Error('CRON_SECRET 환경변수가 필요합니다.');
}

const url = new URL('/api/newsletter/backfill', baseUrl);
url.searchParams.set('from', from);
url.searchParams.set('to', to);

const response = await fetch(url, {
  method: publish ? 'POST' : 'GET',
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(300_000),
});
const payload = await response.json();

if (!response.ok) {
  throw new Error(
    `백필 요청 실패 (${response.status}): ${payload.error ?? JSON.stringify(payload)}`,
  );
}

const summary = {
  mode: publish ? 'archive-only-publish' : 'dry-run',
  success: payload.success ?? true,
  archiveOnly: payload.archiveOnly ?? !publish,
  emailSent: payload.emailSent,
  from: payload.from,
  to: payload.to,
  existingPublicDates: payload.existingPublicDates,
  generatedDates: payload.generatedDates,
  emptyDates: payload.emptyDates,
  dates: (payload.dates ?? []).map((result) => ({
    date: result.date,
    skippedExistingPublic: result.skippedExistingPublic,
    articleCount: result.articles?.length ?? 0,
    articles: (result.articles ?? []).map((article) => ({
      title: article.title,
      source: article.source,
      url: article.url,
    })),
    stats: result.stats,
    errors: result.errors,
  })),
};

console.log(JSON.stringify(summary, null, 2));

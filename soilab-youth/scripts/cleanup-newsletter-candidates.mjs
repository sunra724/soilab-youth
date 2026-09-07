import nextEnv from '@next/env';
import notionPackage from '@notionhq/client';
import { assessNewsPolicy } from '../src/config/keywords.ts';

const { loadEnvConfig } = nextEnv;
const { Client } = notionPackage;

loadEnvConfig(process.cwd());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const dataSourceId = process.env.NOTION_CANDIDATES_COLLECTION;
const apply = process.argv.includes('--apply');
const limitArgument = process.argv.find((value) => value.startsWith('--limit='));
const limit = Math.max(1, Number(limitArgument?.split('=')[1] ?? 150));
const since = process.argv.find((value) => value.startsWith('--since='))?.split('=')[1]
  ?? new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString().slice(0, 10);

if (!dataSourceId) {
  throw new Error('NOTION_CANDIDATES_COLLECTION is required.');
}

async function listCandidates() {
  const pages = [];
  let startCursor;

  do {
    const response = await retry(() => notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
        filter: { property: '수집일', date: { on_or_after: since } },
        ...(startCursor ? { start_cursor: startCursor } : {}),
      }));
    pages.push(...response.results);
    startCursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (startCursor);

  return pages;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function retry(operation, attempt = 1) {
  try {
    return await operation();
  } catch (error) {
    const status = error?.status ?? error?.code;
    const retryable = !status
      || status === 429
      || status === 'rate_limited'
      || Number(status) >= 500;
    if (retryable && attempt <= 6) {
      await sleep(attempt * 1_000);
      return retry(operation, attempt + 1);
    }
    throw error;
  }
}

function audit(page) {
  const properties = page.properties;
  const input = {
    title: properties['제목']?.title?.[0]?.plain_text ?? '',
    url: properties['원문링크']?.url ?? '',
    source: properties['출처']?.rich_text?.[0]?.plain_text ?? '',
    description: properties['요약']?.rich_text?.[0]?.plain_text ?? '',
    requirePublisher: true,
    allowReviewedSensitive: false,
  };
  return {
    id: page.id,
    title: input.title,
    result: assessNewsPolicy(input),
  };
}

async function archiveWithRetry(id, attempt = 1) {
  return retry(() => notion.pages.update({ page_id: id, archived: true }), attempt);
}

async function archiveTargets(targets) {
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      await archiveWithRetry(targets[index].id);
    }
  }
  await Promise.all([worker(), worker()]);
}

const audited = (await listCandidates()).map(audit);
const rejected = audited.filter((item) => item.result.status === 'rejected');
const review = audited.filter((item) => item.result.status === 'review');
const targets = [...rejected, ...review].slice(0, limit);

if (apply) {
  await archiveTargets(targets);
}

const reasonCounts = audited.reduce((counts, item) => {
  const key = `${item.result.status}:${item.result.reason}`;
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({
  since,
  mode: apply ? 'apply' : 'audit',
  total: audited.length,
  accepted: audited.filter((item) => item.result.status === 'accepted').length,
  rejected: rejected.length,
  review: review.length,
  processed: apply ? targets.length : 0,
  remainingAfterBatch: apply
    ? Math.max(0, rejected.length + review.length - targets.length)
    : rejected.length + review.length,
  recoverable: true,
  reasonCounts,
}, null, 2));

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { Client } from '@notionhq/client';
import {
  NEWS_SEARCH_QUERIES,
  assessNewsPolicy,
  classifyNewsCategory,
  isRegisteredPressSource,
} from '@/config/keywords';
import {
  decodeGoogleNewsUrls,
  stripGoogleNewsPublisher,
} from '@/lib/googleNews';
import { isSameNewsStory } from '@/lib/newsletterDedupe';
import {
  CANDIDATE_PROPS,
} from '@/lib/notionSchema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const parser = new Parser({
  timeout: 10_000,
  customFields: { item: ['source'] },
});
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CANDIDATES_DB_ID = process.env.NOTION_CANDIDATES_DB!;
const CANDIDATES_COLLECTION_ID = process.env.NOTION_CANDIDATES_COLLECTION!;
const REVIEW_PENDING_CATEGORY = '검수대기';

interface RawNewsCandidate {
  title: string;
  encodedUrl: string;
  source: string;
  pubDate: string;
  description: string;
}

interface ExistingReferences {
  urls: Set<string>;
  titles: Set<string>;
  stories: Array<{ title: string; publishedAt: string }>;
}

function googleRssUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:30d`)}&hl=ko&gl=KR&ceid=KR:ko`;
}

function numberEnv(name: string, fallback: number, max: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(value), max);
}

function normalizedTitle(value: string) {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ko-KR');
}

async function getExistingReferences(): Promise<ExistingReferences> {
  const urls = new Set<string>();
  const titles = new Set<string>();
  const stories: ExistingReferences['stories'] = [];
  let startCursor: string | undefined;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 60);

  try {
    do {
      const res = await notion.dataSources.query({
        data_source_id: CANDIDATES_COLLECTION_ID,
        page_size: 100,
        filter: {
          property: CANDIDATE_PROPS.collectedAt,
          date: { on_or_after: since.toISOString().slice(0, 10) },
        },
        ...(startCursor ? { start_cursor: startCursor } : {}),
      });

      for (const page of res.results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties = (page as any).properties;
        const url = properties?.[CANDIDATE_PROPS.url]?.url;
        const title = properties?.[CANDIDATE_PROPS.title]?.title?.[0]?.plain_text;
        const publishedAt = properties?.[CANDIDATE_PROPS.collectedAt]?.date?.start ?? '';
        if (url) urls.add(url);
        if (title) {
          titles.add(normalizedTitle(title));
          stories.push({ title, publishedAt });
        }
      }

      startCursor = res.has_more && res.next_cursor
        ? res.next_cursor
        : undefined;
    } while (startCursor);
  } catch (error) {
    console.error('[collect] getExistingReferences:', error);
  }

  return { urls, titles, stories };
}

function toIsoDate(pubDate: string) {
  const date = new Date(pubDate);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
}

async function readRawCandidates() {
  const candidates = new Map<string, RawNewsCandidate>();
  const errors: string[] = [];
  const perQuery = numberEnv('NEWS_ITEM_LIMIT_PER_QUERY', 8, 15);
  const poolLimit = numberEnv('NEWS_DECODE_POOL_LIMIT', 60, 100);

  for (const query of NEWS_SEARCH_QUERIES) {
    if (candidates.size >= poolLimit) break;

    try {
      const rss = await parser.parseURL(googleRssUrl(query));

      for (const item of rss.items.slice(0, perQuery)) {
        const encodedUrl = item.link ?? '';
        const source = String((item as { source?: string }).source ?? '').trim();
        const title = stripGoogleNewsPublisher(item.title ?? '', source);
        const description = item.contentSnippet ?? item.content ?? '';

        if (!encodedUrl || candidates.has(encodedUrl) || !isRegisteredPressSource(source)) {
          continue;
        }

        const preflight = assessNewsPolicy({
          title,
          description,
          source,
          requirePublisher: true,
        });
        if (preflight.status === 'rejected' && preflight.reason !== '포털·재배포 링크') {
          continue;
        }

        candidates.set(encodedUrl, {
          title,
          encodedUrl,
          source,
          pubDate: item.pubDate ?? new Date().toISOString(),
          description,
        });

        if (candidates.size >= poolLimit) break;
      }
    } catch (error) {
      errors.push(`${query}: ${String(error)}`);
      console.error('[collect] feed error:', query, error);
    }
  }

  return { candidates: [...candidates.values()], errors };
}

async function saveToNotion(item: {
  title: string;
  url: string;
  source: string;
  pubDate: string;
  category: string;
  reviewReason?: string;
}) {
  await notion.pages.create({
    parent: { database_id: CANDIDATES_DB_ID },
    properties: {
      [CANDIDATE_PROPS.title]: { title: [{ text: { content: item.title } }] },
      [CANDIDATE_PROPS.url]: { url: item.url },
      [CANDIDATE_PROPS.source]: { rich_text: [{ text: { content: item.source } }] },
      [CANDIDATE_PROPS.collectedAt]: { date: { start: toIsoDate(item.pubDate) } },
      [CANDIDATE_PROPS.summary]: {
        rich_text: item.reviewReason
          ? [{ text: { content: `[검수대기] ${item.reviewReason}` } }]
          : [],
      },
      [CANDIDATE_PROPS.category]: { select: { name: item.category } },
      [CANDIDATE_PROPS.isSelected]: { checkbox: false },
      [CANDIDATE_PROPS.isSent]: { checkbox: false },
    },
  });
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await getExistingReferences();
  const { candidates, errors } = await readRawCandidates();
  const decodedUrls = await decodeGoogleNewsUrls(
    candidates.map((candidate) => candidate.encodedUrl),
  );
  const saved: string[] = [];
  const reviewPending: string[] = [];
  const rejected: Array<{ title: string; reason: string }> = [];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const url = decodedUrls[index] ?? '';
    const titleKey = normalizedTitle(candidate.title);

    if (!url) {
      rejected.push({ title: candidate.title, reason: '언론사 원문 URL 확인 실패' });
      continue;
    }
    if (existing.urls.has(url) || existing.titles.has(titleKey)) {
      continue;
    }
    const publishedAt = toIsoDate(candidate.pubDate);
    if (existing.stories.some((story) => isSameNewsStory(
      { title: candidate.title, publishedAt },
      story,
    ))) {
      rejected.push({ title: candidate.title, reason: '동일 사건의 중복 보도' });
      continue;
    }

    const policy = assessNewsPolicy({
      title: candidate.title,
      description: candidate.description,
      source: candidate.source,
      url,
      requirePublisher: true,
    });
    if (policy.status === 'rejected') {
      rejected.push({ title: candidate.title, reason: policy.reason });
      continue;
    }

    const category = policy.status === 'review'
      ? REVIEW_PENDING_CATEGORY
      : classifyNewsCategory(`${candidate.title} ${candidate.description}`);
    await saveToNotion({
      title: candidate.title,
      url,
      source: candidate.source,
      pubDate: candidate.pubDate,
      category,
      ...(policy.status === 'review' ? { reviewReason: policy.reason } : {}),
    });

    existing.urls.add(url);
    existing.titles.add(titleKey);
    existing.stories.push({ title: candidate.title, publishedAt });
    if (policy.status === 'review') {
      reviewPending.push(candidate.title);
    } else {
      saved.push(candidate.title);
    }
  }

  return NextResponse.json({
    saved: saved.length,
    reviewPending: reviewPending.length,
    rejected: rejected.length,
    videoSaved: 0,
    portalLinksSaved: 0,
    titles: saved,
    reviewPendingTitles: reviewPending,
    rejectedPreview: rejected.slice(0, 10),
    errors,
    policy: {
      source: 'registered-press-only',
      directPublisherLinks: true,
      summariesGenerated: false,
      videosEnabled: false,
      maximumDailyItems: 7,
    },
  });
}

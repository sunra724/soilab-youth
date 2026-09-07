import { Client } from '@notionhq/client';
import Parser from 'rss-parser';
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
import {
  collapseRelatedNews,
  isSameNewsStory,
} from '@/lib/newsletterDedupe';
import {
  addIsoDays,
  enumerateHistoricalDates,
  historicalGoogleNewsRssUrl,
  kstDateKey,
} from '@/lib/newsletterBackfillDate';
import { NEWSLETTER_PROPS } from '@/lib/notionSchema';
import {
  fetchPublisherArticleMetadata,
  isExcludedPublisherSection,
} from '@/lib/publisherArticleMetadata';

const parser = new Parser({
  timeout: 10_000,
  customFields: { item: ['source'] },
});
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const MAX_ARTICLES_PER_ISSUE = 7;

interface RawHistoricalCandidate {
  title: string;
  encodedUrl: string;
  source: string;
  pubDate: string;
  description: string;
}

export interface HistoricalNewsletterArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

interface NewsReference {
  title: string;
  url: string;
  publishedAt: string;
}

export interface HistoricalDateResult {
  date: string;
  articles: HistoricalNewsletterArticle[];
  skippedExistingPublic: boolean;
  stats: {
    targetDateCandidates: number;
    registeredSourceCandidates: number;
    directUrlsResolved: number;
    acceptedBeforeDedupe: number;
    removedAsDuplicate: number;
    rejected: number;
    reviewRequired: number;
  };
  rejectedPreview: Array<{ title: string; reason: string }>;
  errors: string[];
}

export interface NewsletterBackfillResult {
  from: string;
  to: string;
  dates: HistoricalDateResult[];
  existingPublicDates: string[];
  generatedDates: string[];
  emptyDates: string[];
  emailSent: false;
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

function titleText(page: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (page as any)?.properties?.[NEWSLETTER_PROPS.title]?.title
    ?.map((item: { plain_text?: string }) => item.plain_text ?? '')
    .join('') ?? '';
}

function pageDate(page: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (page as any)?.properties?.[NEWSLETTER_PROPS.publishedAt]?.date?.start ?? '';
}

function blockText(block: unknown, type: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const richText = (block as any)?.[type]?.rich_text;
  if (!Array.isArray(richText)) return '';
  return richText.map((text) => text?.plain_text ?? '').join('');
}

function blockLink(block: unknown, type: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const richText = (block as any)?.[type]?.rich_text;
  if (!Array.isArray(richText)) return '';
  return richText.find((text) => text?.href)?.href ?? '';
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  mapper: (value: T) => Promise<R>,
) {
  const output = new Array<R>(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await mapper(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker()),
  );
  return output;
}

async function readHistoricalCandidates(date: string) {
  const perQuery = numberEnv('NEWS_ITEM_LIMIT_PER_QUERY', 8, 15);
  const poolLimit = numberEnv('NEWS_DECODE_POOL_LIMIT', 100, 150);
  const feedResults = await mapWithConcurrency(
    [...NEWS_SEARCH_QUERIES],
    4,
    async (query) => {
      try {
        const rss = await parser.parseURL(historicalGoogleNewsRssUrl(query, date));
        return { query, items: rss.items.slice(0, perQuery), error: '' };
      } catch (error) {
        return { query, items: [], error: String(error) };
      }
    },
  );

  const candidates = new Map<string, RawHistoricalCandidate>();
  const titleKeys = new Set<string>();
  const errors: string[] = [];
  let targetDateCandidates = 0;
  let registeredSourceCandidates = 0;
  let rejected = 0;
  let reviewRequired = 0;
  const rejectedPreview: Array<{ title: string; reason: string }> = [];

  for (const result of feedResults) {
    if (result.error) {
      errors.push(`${result.query}: ${result.error}`);
    }

    for (const item of result.items) {
      const pubDate = item.pubDate ?? '';
      if (!pubDate || kstDateKey(pubDate) !== date) {
        continue;
      }
      targetDateCandidates += 1;

      const encodedUrl = item.link ?? '';
      const source = String((item as { source?: string }).source ?? '').trim();
      const title = stripGoogleNewsPublisher(item.title ?? '', source);
      const titleKey = normalizedTitle(title);
      if (
        !encodedUrl
        || candidates.has(encodedUrl)
        || titleKeys.has(titleKey)
        || candidates.size >= poolLimit
      ) {
        continue;
      }
      if (!isRegisteredPressSource(source)) {
        continue;
      }
      registeredSourceCandidates += 1;

      const description = item.contentSnippet ?? item.content ?? '';
      const preflight = assessNewsPolicy({
        title,
        description,
        source,
        requirePublisher: true,
      });
      if (preflight.status !== 'accepted') {
        if (preflight.status === 'review') {
          reviewRequired += 1;
        } else {
          rejected += 1;
        }
        if (rejectedPreview.length < 10) {
          rejectedPreview.push({ title, reason: preflight.reason });
        }
        continue;
      }

      candidates.set(encodedUrl, {
        title,
        encodedUrl,
        source,
        pubDate,
        description,
      });
      titleKeys.add(titleKey);
    }
  }

  return {
    candidates: [...candidates.values()],
    errors,
    targetDateCandidates,
    registeredSourceCandidates,
    rejected,
    reviewRequired,
    rejectedPreview,
  };
}

async function collectHistoricalDate(date: string): Promise<HistoricalDateResult> {
  const raw = await readHistoricalCandidates(date);
  const decodedUrls = await decodeGoogleNewsUrls(
    raw.candidates.map((candidate) => candidate.encodedUrl),
  );
  const accepted: HistoricalNewsletterArticle[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const policyAccepted: Array<{
    candidate: RawHistoricalCandidate;
    url: string;
  }> = [];
  let directUrlsResolved = 0;
  let rejected = raw.rejected;
  let reviewRequired = raw.reviewRequired;

  for (let index = 0; index < raw.candidates.length; index += 1) {
    const candidate = raw.candidates[index];
    const url = decodedUrls[index] ?? '';
    if (!url) {
      rejected += 1;
      if (raw.rejectedPreview.length < 10) {
        raw.rejectedPreview.push({
          title: candidate.title,
          reason: '언론사 원문 URL 확인 실패',
        });
      }
      continue;
    }
    directUrlsResolved += 1;

    const policy = assessNewsPolicy({
      title: candidate.title,
      description: candidate.description,
      source: candidate.source,
      url,
      requirePublisher: true,
    });
    if (policy.status !== 'accepted') {
      if (policy.status === 'review') {
        reviewRequired += 1;
      } else {
        rejected += 1;
      }
      if (raw.rejectedPreview.length < 10) {
        raw.rejectedPreview.push({ title: candidate.title, reason: policy.reason });
      }
      continue;
    }

    policyAccepted.push({ candidate, url });
  }

  const publisherMetadata = await mapWithConcurrency(
    policyAccepted,
    5,
    ({ url }) => fetchPublisherArticleMetadata(url),
  );

  for (let index = 0; index < policyAccepted.length; index += 1) {
    const { candidate, url } = policyAccepted[index];
    const metadata = publisherMetadata[index];
    if (isExcludedPublisherSection(metadata.sections)) {
      rejected += 1;
      if (raw.rejectedPreview.length < 10) {
        raw.rejectedPreview.push({
          title: candidate.title,
          reason: `문화·스포츠 섹션 (${metadata.sections.join(', ')})`,
        });
      }
      continue;
    }

    const publisherDate = metadata.publishedTime
      ? kstDateKey(metadata.publishedTime)
      : date;
    if (publisherDate && publisherDate !== date) {
      rejected += 1;
      if (raw.rejectedPreview.length < 10) {
        raw.rejectedPreview.push({
          title: candidate.title,
          reason: `언론사 원문 발행일 불일치 (${publisherDate})`,
        });
      }
      continue;
    }

    const titleKey = normalizedTitle(candidate.title);
    if (seenUrls.has(url) || seenTitles.has(titleKey)) {
      continue;
    }
    seenUrls.add(url);
    seenTitles.add(titleKey);
    accepted.push({
      title: candidate.title,
      url,
      source: candidate.source,
      publishedAt: date,
      category: classifyNewsCategory(
        `${candidate.title} ${candidate.description}`,
      ),
    });
  }

  const distinct = collapseRelatedNews(accepted);
  const articles = distinct.slice(0, MAX_ARTICLES_PER_ISSUE);

  return {
    date,
    articles,
    skippedExistingPublic: false,
    stats: {
      targetDateCandidates: raw.targetDateCandidates,
      registeredSourceCandidates: raw.registeredSourceCandidates,
      directUrlsResolved,
      acceptedBeforeDedupe: accepted.length,
      removedAsDuplicate: accepted.length - articles.length,
      rejected,
      reviewRequired,
    },
    rejectedPreview: raw.rejectedPreview,
    errors: raw.errors,
  };
}

async function publicArchiveReferences(from: string, to: string) {
  const collectionId = process.env.NOTION_NEWSLETTER_COLLECTION;
  if (!collectionId) {
    throw new Error('NOTION_NEWSLETTER_COLLECTION 환경변수가 필요합니다.');
  }

  const references: NewsReference[] = [];
  const publicDates = new Set<string>();
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: collectionId,
      page_size: 100,
      filter: {
        and: [
          {
            property: NEWSLETTER_PROPS.publishedAt,
            date: { on_or_after: addIsoDays(from, -3) },
          },
          {
            property: NEWSLETTER_PROPS.publishedAt,
            date: { on_or_before: addIsoDays(to, 3) },
          },
          {
            property: NEWSLETTER_PROPS.isPublic,
            checkbox: { equals: true },
          },
        ],
      },
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });

    for (const page of response.results) {
      const title = titleText(page);
      const publishedAt = pageDate(page);
      if (!title.includes('뉴스클리핑') || !publishedAt) continue;
      publicDates.add(publishedAt);

      let blockCursor: string | undefined;
      do {
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
          page_size: 100,
          ...(blockCursor ? { start_cursor: blockCursor } : {}),
        });
        for (const block of blocks.results) {
          if (!('type' in block) || block.type !== 'bulleted_list_item') {
            continue;
          }
          const articleTitle = blockText(block, 'bulleted_list_item');
          const url = blockLink(block, 'bulleted_list_item');
          if (articleTitle && url) {
            references.push({ title: articleTitle, url, publishedAt });
          }
        }
        blockCursor = blocks.has_more && blocks.next_cursor
          ? blocks.next_cursor
          : undefined;
      } while (blockCursor);
    }

    startCursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (startCursor);

  return { references, publicDates };
}

function isDuplicateArticle(
  article: HistoricalNewsletterArticle,
  references: NewsReference[],
) {
  const titleKey = normalizedTitle(article.title);
  return references.some((reference) =>
    reference.url === article.url
    || normalizedTitle(reference.title) === titleKey
    || isSameNewsStory(article, reference)
  );
}

export async function previewNewsletterBackfill(
  from: string,
  to: string,
): Promise<NewsletterBackfillResult> {
  const dates = enumerateHistoricalDates(from, to);
  const existing = await publicArchiveReferences(from, to);
  const references = [...existing.references];
  const results: HistoricalDateResult[] = [];

  for (const date of dates) {
    if (existing.publicDates.has(date)) {
      results.push({
        date,
        articles: [],
        skippedExistingPublic: true,
        stats: {
          targetDateCandidates: 0,
          registeredSourceCandidates: 0,
          directUrlsResolved: 0,
          acceptedBeforeDedupe: 0,
          removedAsDuplicate: 0,
          rejected: 0,
          reviewRequired: 0,
        },
        rejectedPreview: [],
        errors: [],
      });
      continue;
    }

    const result = await collectHistoricalDate(date);
    const beforeCrossDateDedupe = result.articles.length;
    result.articles = result.articles.filter(
      (article) => !isDuplicateArticle(article, references),
    );
    result.stats.removedAsDuplicate +=
      beforeCrossDateDedupe - result.articles.length;
    references.push(
      ...result.articles.map((article) => ({
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
      })),
    );
    results.push(result);
  }

  const output: NewsletterBackfillResult = {
    from,
    to,
    dates: results,
    existingPublicDates: [...existing.publicDates]
      .filter((date) => date >= from && date <= to)
      .sort(),
    generatedDates: [],
    emptyDates: results
      .filter((result) =>
        !result.skippedExistingPublic && result.articles.length === 0
      )
      .map((result) => result.date),
    emailSent: false,
  };
  return output;
}

function kstIssueLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00+09:00`);
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(parsed);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}년 ${month}월 ${day}일`;
}

async function getNextIssueNumber() {
  const collectionId = process.env.NOTION_NEWSLETTER_COLLECTION;
  if (!collectionId) {
    throw new Error('NOTION_NEWSLETTER_COLLECTION 환경변수가 필요합니다.');
  }
  const response = await notion.dataSources.query({
    data_source_id: collectionId,
    page_size: 1,
    sorts: [{ property: NEWSLETTER_PROPS.issueNumber, direction: 'descending' }],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((response.results[0] as any)
    ?.properties?.[NEWSLETTER_PROPS.issueNumber]?.number ?? 0) + 1;
}

async function createPublicArchive(
  date: string,
  issueNumber: number,
  articles: HistoricalNewsletterArticle[],
) {
  const databaseId = process.env.NOTION_NEWSLETTER_DB;
  if (!databaseId) {
    throw new Error('NOTION_NEWSLETTER_DB 환경변수가 필요합니다.');
  }
  const label = kstIssueLabel(date);
  const categories = Array.from(new Set(
    articles.map((article) => article.category),
  ));
  const summary = [
    `고립·은둔 청년과 회복 지원 현장의 등록 언론사 기사 ${articles.length}건을 안내합니다.`,
    categories.length > 0 ? `주요 카테고리: ${categories.join(', ')}` : '',
  ].filter(Boolean).join(' ');

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      [NEWSLETTER_PROPS.title]: {
        title: [{ text: { content: `다시봄 뉴스클리핑 ${label}` } }],
      },
      [NEWSLETTER_PROPS.issueNumber]: { number: issueNumber },
      [NEWSLETTER_PROPS.publishedAt]: { date: { start: date } },
      [NEWSLETTER_PROPS.summary]: {
        rich_text: [{ text: { content: summary } }],
      },
      [NEWSLETTER_PROPS.isPublic]: { checkbox: true },
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '기사 원문' } }],
        },
      },
      ...articles.flatMap((article) => [
        {
          object: 'block' as const,
          type: 'bulleted_list_item' as const,
          bulleted_list_item: {
            rich_text: [{
              type: 'text' as const,
              text: {
                content: article.title,
                link: { url: article.url },
              },
            }],
          },
        },
        {
          object: 'block' as const,
          type: 'paragraph' as const,
          paragraph: {
            rich_text: [{
              type: 'text' as const,
              text: {
                content: `${article.source} · ${article.publishedAt}`,
              },
            }],
          },
        },
      ]),
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: {
              content: '본 클리핑은 각 언론사가 공개한 기사의 제목과 원문 링크만을 안내합니다. 기사의 저작권은 각 언론사에 있으며, 본문은 원문 링크에서 확인해 주세요.',
            },
          }],
        },
      },
    ],
  });
}

export async function createNewsletterBackfill(from: string, to: string) {
  const preview = await previewNewsletterBackfill(from, to);
  let issueNumber = await getNextIssueNumber();

  for (const result of preview.dates) {
    if (result.skippedExistingPublic || result.articles.length === 0) {
      continue;
    }
    await createPublicArchive(result.date, issueNumber, result.articles);
    preview.generatedDates.push(result.date);
    issueNumber += 1;
  }

  return preview;
}

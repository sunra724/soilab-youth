import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@notionhq/client';
import {
  CANDIDATE_CATEGORIES,
  CANDIDATE_PROPS,
} from '@/lib/notionSchema';

const parser = new Parser({ timeout: 10000 });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CANDIDATES_DB_ID = process.env.NOTION_CANDIDATES_DB!;
const CANDIDATES_COLLECTION_ID = process.env.NOTION_CANDIDATES_COLLECTION!;

interface ContentFeed {
  query: string;
  category: string;
}

interface YouTubeSearchItem {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

interface YouTubeVideoStatsItem {
  id?: string;
  statistics?: {
    viewCount?: string;
  };
}

interface YouTubeVideoStatsResponse {
  items?: YouTubeVideoStatsItem[];
}

interface YouTubeChannelStatsItem {
  id?: string;
  statistics?: {
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
  };
}

interface YouTubeChannelStatsResponse {
  items?: YouTubeChannelStatsItem[];
}

interface YouTubeCandidate {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  subscriberCount: number;
  hiddenSubscriberCount: boolean;
}

const NEWS_FEEDS: ContentFeed[] = [
  { query: '고립은둔', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '고립·은둔', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '고립 은둔', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '고립은둔 청년', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '고립·은둔 청년', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '은둔형외톨이', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '청년 고립 지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '청년지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '사회적가치', category: CANDIDATE_CATEGORIES.socialValue },
  { query: '사회적 가치 거래', category: CANDIDATE_CATEGORIES.socialValue },
  { query: '임팩트 측정 사회적가치', category: CANDIDATE_CATEGORIES.socialValue },
  { query: '임팩트 측정 복지', category: CANDIDATE_CATEGORIES.socialValue },
  { query: '사회성과인센티브', category: CANDIDATE_CATEGORIES.socialValue },
  { query: 'Tradeable Impact', category: CANDIDATE_CATEGORIES.socialValue },
  { query: 'Social Progress Credit', category: CANDIDATE_CATEGORIES.socialValue },
  { query: 'SPC 사회성과', category: CANDIDATE_CATEGORIES.socialValue },
  { query: 'SPC 사회성과인센티브', category: CANDIDATE_CATEGORIES.socialValue },
];

const VIDEO_FEEDS: ContentFeed[] = [
  { query: '고립은둔 청년', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '은둔형외톨이', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '청년지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '사회적가치 청년', category: CANDIDATE_CATEGORIES.socialValue },
];

function googleRssUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
}

function numberEnv(name: string, fallback: number, max: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(value), max);
}

function stringEnv(name: string, fallback: string, allowed: string[]) {
  const value = process.env[name] ?? fallback;
  return allowed.includes(value) ? value : fallback;
}

function parseCount(value?: string) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function youtubeSearchUrl(query: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return '';
  }

  const lookbackDays = numberEnv('YOUTUBE_VIDEO_LOOKBACK_DAYS', 14, 30);
  const publishedAfter = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: query,
    type: 'video',
    order: stringEnv('YOUTUBE_VIDEO_SEARCH_ORDER', 'viewCount', ['date', 'relevance', 'viewCount']),
    relevanceLanguage: 'ko',
    regionCode: 'KR',
    maxResults: String(numberEnv('YOUTUBE_VIDEO_SEARCH_POOL_PER_QUERY', 10, 25)),
    publishedAfter,
  });

  return `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
}

function youtubeStatsUrl(resource: 'videos' | 'channels', ids: string[]) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || ids.length === 0) {
    return '';
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: 'statistics',
    id: ids.join(','),
  });

  return `https://www.googleapis.com/youtube/v3/${resource}?${params.toString()}`;
}

async function summarize(title: string, description: string, contentType = '뉴스 기사'): Promise<string> {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `다음 ${contentType}를 2문장으로 요약해줘. 소이랩 고립·은둔 청년 지원 담당자가 읽을 매일 뉴스클리핑용이야. 핵심 내용만 간결하게.

제목: ${title}
내용: ${description?.slice(0, 300) ?? ''}

요약:`,
        },
      ],
    });

    const block = msg.content[0];
    return block.type === 'text' ? block.text.trim() : '';
  } catch {
    return '';
  }
}

async function getExistingUrls(): Promise<Set<string>> {
  const urls = new Set<string>();

  try {
    const res = await notion.dataSources.query({
      data_source_id: CANDIDATES_COLLECTION_ID,
      page_size: 100,
    });

    for (const page of res.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (page as any).properties?.[CANDIDATE_PROPS.url]?.url;
      if (url) urls.add(url);
    }
  } catch (e) {
    console.error('[collect] getExistingUrls:', e);
  }

  return urls;
}

function toIsoDate(pubDate: string): string {
  try {
    const date = new Date(pubDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  } catch {
    // Ignore parse failures and fall back to today's date.
  }

  return new Date().toISOString().slice(0, 10);
}

async function collectNewsFeed(feed: ContentFeed, existingUrls: Set<string>) {
  const rss = await parser.parseURL(googleRssUrl(feed.query));
  const items = rss.items.slice(0, numberEnv('NEWS_ITEM_LIMIT_PER_QUERY', 10, 20));
  const saved: string[] = [];

  for (const item of items) {
    const url = item.link ?? '';
    if (!url || existingUrls.has(url)) {
      continue;
    }

    const title = item.title ?? '';
    const source = item.creator ?? (item as Record<string, string>)?.source ?? '';
    const pubDate = item.pubDate ?? new Date().toISOString();
    const description = item.contentSnippet ?? item.content ?? '';
    const summary = await summarize(title, description);

    await saveToNotion({
      title,
      url,
      source,
      pubDate,
      summary,
      category: feed.category,
    });

    existingUrls.add(url);
    saved.push(title);
  }

  return saved;
}

async function collectYouTubeFeed(feed: ContentFeed, existingUrls: Set<string>) {
  const url = youtubeSearchUrl(feed.query);
  if (!url) {
    return [];
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  }

  const payload = await res.json() as YouTubeSearchResponse;
  const searchItems = (payload.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet;

      if (!videoId || !snippet?.title || !snippet.channelId) {
        return null;
      }

      return {
        videoId,
        title: snippet.title,
        description: snippet.description ?? '',
        channelId: snippet.channelId,
        channelTitle: snippet.channelTitle ?? '채널명 없음',
        publishedAt: snippet.publishedAt ?? new Date().toISOString(),
      };
    })
    .filter((item): item is Omit<YouTubeCandidate, 'viewCount' | 'subscriberCount' | 'hiddenSubscriberCount'> => Boolean(item));

  const videoStats = await getYouTubeVideoStats(searchItems.map((item) => item.videoId));
  const channelStats = await getYouTubeChannelStats(searchItems.map((item) => item.channelId));
  const minViews = numberEnv('YOUTUBE_MIN_VIEW_COUNT', 1000, 1_000_000_000);
  const minSubscribers = numberEnv('YOUTUBE_MIN_CHANNEL_SUBSCRIBERS', 1000, 100_000_000);
  const saveLimit = numberEnv('YOUTUBE_VIDEO_LIMIT_PER_QUERY', 1, 5);
  const candidates = searchItems
    .map((item): YouTubeCandidate => {
      const channel = channelStats.get(item.channelId);

      return {
        ...item,
        viewCount: videoStats.get(item.videoId) ?? 0,
        subscriberCount: channel?.subscriberCount ?? 0,
        hiddenSubscriberCount: channel?.hiddenSubscriberCount ?? false,
      };
    })
    .filter((item) => item.viewCount >= minViews)
    .filter((item) => item.hiddenSubscriberCount || item.subscriberCount >= minSubscribers)
    .sort((a, b) => scoreYouTubeCandidate(b) - scoreYouTubeCandidate(a))
    .slice(0, saveLimit);
  const saved: string[] = [];

  for (const item of candidates) {
    const videoUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
    if (existingUrls.has(videoUrl)) {
      continue;
    }

    const title = `[영상] ${item.title}`;
    const description = item.description;
    const summary = await summarize(title, description, '유튜브 영상 설명');

    await saveToNotion({
      title,
      url: videoUrl,
      source: formatYouTubeSource(item),
      pubDate: item.publishedAt,
      summary: `${formatYouTubeStats(item)} ${summary}`.trim(),
      category: feed.category,
    });

    existingUrls.add(videoUrl);
    saved.push(title);
  }

  return saved;
}

async function getYouTubeVideoStats(videoIds: string[]) {
  const stats = new Map<string, number>();
  const uniqueIds = Array.from(new Set(videoIds)).slice(0, 50);
  const url = youtubeStatsUrl('videos', uniqueIds);

  if (!url) {
    return stats;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube videos API ${res.status}: ${await res.text()}`);
  }

  const payload = await res.json() as YouTubeVideoStatsResponse;
  for (const item of payload.items ?? []) {
    if (item.id) {
      stats.set(item.id, parseCount(item.statistics?.viewCount));
    }
  }

  return stats;
}

async function getYouTubeChannelStats(channelIds: string[]) {
  const stats = new Map<string, { subscriberCount: number; hiddenSubscriberCount: boolean }>();
  const uniqueIds = Array.from(new Set(channelIds)).slice(0, 50);
  const url = youtubeStatsUrl('channels', uniqueIds);

  if (!url) {
    return stats;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube channels API ${res.status}: ${await res.text()}`);
  }

  const payload = await res.json() as YouTubeChannelStatsResponse;
  for (const item of payload.items ?? []) {
    if (item.id) {
      stats.set(item.id, {
        subscriberCount: parseCount(item.statistics?.subscriberCount),
        hiddenSubscriberCount: Boolean(item.statistics?.hiddenSubscriberCount),
      });
    }
  }

  return stats;
}

function scoreYouTubeCandidate(item: YouTubeCandidate) {
  return Math.log10(item.viewCount + 1) * 2 + Math.log10(item.subscriberCount + 1);
}

function formatNumber(value: number) {
  return value.toLocaleString('ko-KR');
}

function formatYouTubeStats(item: YouTubeCandidate) {
  const subscribers = item.hiddenSubscriberCount
    ? '구독자 비공개'
    : `구독자 ${formatNumber(item.subscriberCount)}명`;

  return `[조회수 ${formatNumber(item.viewCount)}회 · ${subscribers}]`;
}

function formatYouTubeSource(item: YouTubeCandidate) {
  return `YouTube · ${item.channelTitle} · 조회수 ${formatNumber(item.viewCount)}회 · ${
    item.hiddenSubscriberCount ? '구독자 비공개' : `구독자 ${formatNumber(item.subscriberCount)}명`
  }`;
}

async function saveToNotion(item: {
  title: string;
  url: string;
  source: string;
  pubDate: string;
  summary: string;
  category: string;
}) {
  await notion.pages.create({
    parent: { database_id: CANDIDATES_DB_ID },
    properties: {
      [CANDIDATE_PROPS.title]: { title: [{ text: { content: item.title } }] },
      [CANDIDATE_PROPS.url]: { url: item.url },
      [CANDIDATE_PROPS.source]: { rich_text: [{ text: { content: item.source } }] },
      [CANDIDATE_PROPS.collectedAt]: { date: { start: toIsoDate(item.pubDate) } },
      [CANDIDATE_PROPS.summary]: { rich_text: [{ text: { content: item.summary } }] },
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

  const existingUrls = await getExistingUrls();
  const saved: string[] = [];
  const videoSaved: string[] = [];
  const errors: string[] = [];
  const youtubeEnabled = Boolean(process.env.YOUTUBE_API_KEY);

  for (const feed of NEWS_FEEDS) {
    try {
      saved.push(...await collectNewsFeed(feed, existingUrls));
    } catch (e) {
      errors.push(`${feed.query}: ${String(e)}`);
      console.error('[collect] feed error:', feed.query, e);
    }
  }

  if (youtubeEnabled) {
    for (const feed of VIDEO_FEEDS) {
      try {
        videoSaved.push(...await collectYouTubeFeed(feed, existingUrls));
      } catch (e) {
        errors.push(`YouTube ${feed.query}: ${String(e)}`);
        console.error('[collect] YouTube feed error:', feed.query, e);
      }
    }
  }

  return NextResponse.json({
    saved: saved.length + videoSaved.length,
    articleSaved: saved.length,
    videoSaved: videoSaved.length,
    youtubeEnabled,
    titles: [...saved, ...videoSaved],
    errors,
  });
}

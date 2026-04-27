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
    channelTitle?: string;
    publishedAt?: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

const NEWS_FEEDS: ContentFeed[] = [
  { query: '고립은둔 청년', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '은둔형외톨이', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '청년 고립 지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '청년지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '사회적가치', category: CANDIDATE_CATEGORIES.socialValue },
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
    order: 'date',
    relevanceLanguage: 'ko',
    regionCode: 'KR',
    maxResults: String(numberEnv('YOUTUBE_VIDEO_LIMIT_PER_QUERY', 2, 5)),
    publishedAfter,
  });

  return `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
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
  const items = rss.items.slice(0, 5);
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
  const saved: string[] = [];

  for (const item of payload.items ?? []) {
    const videoId = item.id?.videoId;
    const snippet = item.snippet;
    if (!videoId || !snippet?.title) {
      continue;
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    if (existingUrls.has(videoUrl)) {
      continue;
    }

    const title = `[영상] ${snippet.title}`;
    const description = snippet.description ?? '';
    const summary = await summarize(title, description, '유튜브 영상 설명');

    await saveToNotion({
      title,
      url: videoUrl,
      source: `YouTube · ${snippet.channelTitle ?? '채널명 없음'}`,
      pubDate: snippet.publishedAt ?? new Date().toISOString(),
      summary,
      category: feed.category,
    });

    existingUrls.add(videoUrl);
    saved.push(title);
  }

  return saved;
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

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

const FEEDS = [
  { query: '고립은둔 청년', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '은둔형외톨이', category: CANDIDATE_CATEGORIES.isolationYouth },
  { query: '청년 고립 지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '청년지원', category: CANDIDATE_CATEGORIES.youthSupport },
  { query: '사회적가치', category: CANDIDATE_CATEGORIES.socialValue },
];

function googleRssUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
}

async function summarize(title: string, description: string): Promise<string> {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `다음 뉴스 기사를 2문장으로 요약해줘. 소이랩 고립·은둔 청년 지원 담당자가 읽을 매일 뉴스클리핑용이야. 핵심 내용만 간결하게.

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
  const errors: string[] = [];

  for (const feed of FEEDS) {
    try {
      const rss = await parser.parseURL(googleRssUrl(feed.query));
      const items = rss.items.slice(0, 5);

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
    } catch (e) {
      errors.push(`${feed.query}: ${String(e)}`);
      console.error('[collect] feed error:', feed.query, e);
    }
  }

  return NextResponse.json({ saved: saved.length, titles: saved, errors });
}

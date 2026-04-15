import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@notionhq/client';

const parser = new Parser({ timeout: 10000 });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DB_ID = process.env.NOTION_CANDIDATES_DB!;
const COLLECTION_ID = process.env.NOTION_CANDIDATES_COLLECTION!;

// 수집 키워드별 카테고리
const FEEDS = [
  { query: '고립은둔 청년', category: '고립은둔' },
  { query: '은둔형외톨이', category: '고립은둔' },
  { query: '청년 고립 지원', category: '청년지원' },
  { query: '청년 복지 사업', category: '청년지원' },
  { query: '사회적기업 협동조합', category: '사회적경제' },
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
          content: `다음 뉴스 기사를 2문장으로 요약해줘. 소이랩 고립·은둔 청년 지원 담당자가 읽을 뉴스레터용이야. 핵심 내용만 간결하게.

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

// 이미 노션에 저장된 URL 목록 가져오기 (중복 방지)
async function getExistingUrls(): Promise<Set<string>> {
  const urls = new Set<string>();
  try {
    const res = await notion.dataSources.query({
      data_source_id: COLLECTION_ID,
      page_size: 100,
    });
    for (const page of res.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (page as any).properties?.['원문링크']?.url;
      if (url) urls.add(url);
    }
  } catch (e) {
    console.error('[collect] getExistingUrls:', e);
  }
  return urls;
}

function toIsoDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {
    // ignore
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
    parent: { database_id: DB_ID },
    properties: {
      '제목': { title: [{ text: { content: item.title } }] },
      '원문링크': { url: item.url },
      '출처': { rich_text: [{ text: { content: item.source } }] },
      '수집일': { date: { start: toIsoDate(item.pubDate) } },
      '요약': { rich_text: [{ text: { content: item.summary } }] },
      '카테고리': { select: { name: item.category } },
      '발송선택': { checkbox: false },
      '발송완료': { checkbox: false },
    },
  });
}

export async function GET(req: Request) {
  // cron secret 검증
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
      const items = rss.items.slice(0, 5); // 키워드당 최신 5건

      for (const item of items) {
        const url = item.link ?? '';
        if (!url || existingUrls.has(url)) continue;

        const title = item.title ?? '';
        const source = item.creator ?? (item as Record<string, string>)['source'] ?? '';
        const pubDate = item.pubDate ?? new Date().toISOString();
        const description = item.contentSnippet ?? item.content ?? '';

        const summary = await summarize(title, description);

        await saveToNotion({ title, url, source, pubDate, summary, category: feed.category });
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

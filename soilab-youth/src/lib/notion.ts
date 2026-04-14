import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';
import type { CardNews, Newsletter, StatItem } from '@/types/notion';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProp(props: any, key: string) {
  return props?.[key];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function titleProp(props: any, key: string): string {
  return getProp(props, key)?.title?.[0]?.plain_text ?? '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richTextProp(props: any, key: string): string {
  return getProp(props, key)?.rich_text?.[0]?.plain_text ?? '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function selectProp(props: any, key: string): string {
  return getProp(props, key)?.select?.name ?? '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dateProp(props: any, key: string): string {
  return getProp(props, key)?.date?.start ?? '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function urlProp(props: any, key: string): string {
  return getProp(props, key)?.url ?? '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function numberProp(props: any, key: string): number {
  return getProp(props, key)?.number ?? 0;
}

export const getCardNewsList = unstable_cache(
  async (): Promise<CardNews[]> => {
    try {
      const res = await notion.dataSources.query({
        data_source_id: process.env.NOTION_CARDNEWS_DB!,
        filter: { property: '공개', checkbox: { equals: true } },
        sorts: [{ property: '발행일', direction: 'descending' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.results.map((page: any) => ({
        id: page.id,
        title: titleProp(page.properties, '제목'),
        category: selectProp(page.properties, '카테고리'),
        project: selectProp(page.properties, '사업'),
        publishedAt: dateProp(page.properties, '발행일'),
        thumbnailColor: selectProp(page.properties, '썸네일색상'),
        summary: richTextProp(page.properties, '요약'),
        externalUrl: urlProp(page.properties, '외부링크'),
      }));
    } catch (e) {
      console.error('[Notion] getCardNewsList:', e);
      return [];
    }
  },
  ['cardnews-list'],
  { revalidate: 3600, tags: ['cardnews'] }
);

export const getCardNewsDetail = unstable_cache(
  async (id: string): Promise<CardNews | null> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await notion.pages.retrieve({ page_id: id }) as any;
      return {
        id: page.id,
        title: titleProp(page.properties, '제목'),
        category: selectProp(page.properties, '카테고리'),
        project: selectProp(page.properties, '사업'),
        publishedAt: dateProp(page.properties, '발행일'),
        thumbnailColor: selectProp(page.properties, '썸네일색상'),
        summary: richTextProp(page.properties, '요약'),
        externalUrl: urlProp(page.properties, '외부링크'),
      };
    } catch (e) {
      console.error('[Notion] getCardNewsDetail:', e);
      return null;
    }
  },
  ['cardnews-detail'],
  { revalidate: 3600, tags: ['cardnews'] }
);

export const getNewsletterList = unstable_cache(
  async (): Promise<Newsletter[]> => {
    try {
      const res = await notion.dataSources.query({
        data_source_id: process.env.NOTION_NEWSLETTER_DB!,
        filter: { property: '공개', checkbox: { equals: true } },
        sorts: [{ property: '발행호수', direction: 'descending' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.results.map((page: any) => ({
        id: page.id,
        title: titleProp(page.properties, '제목'),
        issueNumber: numberProp(page.properties, '발행호수'),
        publishedAt: dateProp(page.properties, '발행일'),
        summary: richTextProp(page.properties, '요약'),
        pdfUrl: urlProp(page.properties, 'PDF링크'),
      }));
    } catch (e) {
      console.error('[Notion] getNewsletterList:', e);
      return [];
    }
  },
  ['newsletter-list'],
  { revalidate: 3600, tags: ['newsletter'] }
);

export const getStatsList = unstable_cache(
  async (): Promise<StatItem[]> => {
    try {
      const res = await notion.dataSources.query({
        data_source_id: process.env.NOTION_STATS_DB!,
        filter: { property: '활성', checkbox: { equals: true } },
        sorts: [{ property: '순서', direction: 'ascending' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.results.map((page: any) => ({
        id: page.id,
        name: titleProp(page.properties, '지표명'),
        value: numberProp(page.properties, '수치'),
        unit: selectProp(page.properties, '단위'),
        description: richTextProp(page.properties, '설명'),
      }));
    } catch (e) {
      console.error('[Notion] getStatsList:', e);
      return [];
    }
  },
  ['stats-list'],
  { revalidate: 3600, tags: ['stats'] }
);

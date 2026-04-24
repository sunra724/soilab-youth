import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';
import type { CardNews, Newsletter, StatItem } from '@/types/notion';
import {
  CARDNEWS_PROPS,
  NEWSLETTER_PROPS,
  STATS_PROPS,
} from '@/lib/notionSchema';

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
        data_source_id: process.env.NOTION_CARDNEWS_COLLECTION!,
        filter: { property: CARDNEWS_PROPS.isPublic, checkbox: { equals: true } },
        sorts: [{ property: CARDNEWS_PROPS.publishedAt, direction: 'descending' }],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.results.map((page: any) => ({
        id: page.id,
        title: titleProp(page.properties, CARDNEWS_PROPS.title),
        category: selectProp(page.properties, CARDNEWS_PROPS.category),
        project: selectProp(page.properties, CARDNEWS_PROPS.project),
        publishedAt: dateProp(page.properties, CARDNEWS_PROPS.publishedAt),
        thumbnailColor: selectProp(page.properties, CARDNEWS_PROPS.thumbnailColor),
        summary: richTextProp(page.properties, CARDNEWS_PROPS.summary),
        externalUrl: urlProp(page.properties, CARDNEWS_PROPS.externalUrl),
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
      const page = (await notion.pages.retrieve({ page_id: id })) as any;

      return {
        id: page.id,
        title: titleProp(page.properties, CARDNEWS_PROPS.title),
        category: selectProp(page.properties, CARDNEWS_PROPS.category),
        project: selectProp(page.properties, CARDNEWS_PROPS.project),
        publishedAt: dateProp(page.properties, CARDNEWS_PROPS.publishedAt),
        thumbnailColor: selectProp(page.properties, CARDNEWS_PROPS.thumbnailColor),
        summary: richTextProp(page.properties, CARDNEWS_PROPS.summary),
        externalUrl: urlProp(page.properties, CARDNEWS_PROPS.externalUrl),
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
        data_source_id: process.env.NOTION_NEWSLETTER_COLLECTION!,
        filter: { property: NEWSLETTER_PROPS.isPublic, checkbox: { equals: true } },
        sorts: [{ property: NEWSLETTER_PROPS.issueNumber, direction: 'descending' }],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.results.map((page: any) => ({
        id: page.id,
        title: titleProp(page.properties, NEWSLETTER_PROPS.title),
        issueNumber: numberProp(page.properties, NEWSLETTER_PROPS.issueNumber),
        publishedAt: dateProp(page.properties, NEWSLETTER_PROPS.publishedAt),
        summary: richTextProp(page.properties, NEWSLETTER_PROPS.summary),
        pdfUrl: urlProp(page.properties, NEWSLETTER_PROPS.pdfUrl),
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
        data_source_id: process.env.NOTION_STATS_COLLECTION!,
        filter: { property: STATS_PROPS.isActive, checkbox: { equals: true } },
        sorts: [{ property: STATS_PROPS.order, direction: 'ascending' }],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.results.map((page: any) => ({
        id: page.id,
        name: titleProp(page.properties, STATS_PROPS.name),
        value: numberProp(page.properties, STATS_PROPS.value),
        unit: selectProp(page.properties, STATS_PROPS.unit),
        description: richTextProp(page.properties, STATS_PROPS.description),
      }));
    } catch (e) {
      console.error('[Notion] getStatsList:', e);
      return [];
    }
  },
  ['stats-list'],
  { revalidate: 3600, tags: ['stats'] }
);

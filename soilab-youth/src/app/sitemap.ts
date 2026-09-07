import type { MetadataRoute } from 'next';
import { researchTopics } from '@/data/research';
import { researchNotes } from '@/data/research-notes';
import { getSourceCatalog } from '@/lib/research/catalog';
import { getCardNewsList, getNewsletterList } from '@/lib/notion';
import { getBriefingSitemapEntries } from '@/lib/research/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.soilab-youth.kr';
  const [{ items: evidenceLibrary }, cardNews, newsletters, briefings] = await Promise.all([
    getSourceCatalog(),
    getCardNewsList(),
    getNewsletterList(),
    getBriefingSitemapEntries(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/livinglab`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/research`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/research/evidence`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/research/notes`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/research/support`, lastModified: '2026-09-07', changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/research/statistics`, lastModified: '2026-09-07', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/research/topics`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/research/briefings`, changeFrequency: 'daily', priority: 0.7 },
    ...evidenceLibrary.map(item => ({ url: `${baseUrl}/research/evidence/${item.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...researchTopics.map(item => ({ url: `${baseUrl}/research/topics/${item.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...researchNotes.map(item => ({ url: `${baseUrl}/research/notes/${item.id}`, lastModified: item.publishedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
    { url: `${baseUrl}/cardnews`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/newsletter`, changeFrequency: 'daily', priority: 0.7 },
    ...cardNews.filter(item => item.title).map(item => ({
      url: `${baseUrl}/cardnews/${encodeURIComponent(item.id)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...newsletters.filter(item => item.title).map(item => {
      // Match the date-based canonical used by news-clipping detail pages.
      const slug = item.title.includes('뉴스클리핑') && item.publishedAt
        ? item.publishedAt
        : item.id;
      return {
        url: `${baseUrl}/newsletter/${encodeURIComponent(slug)}`,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    }),
    ...briefings.map(item => ({
      url: `${baseUrl}/research/briefings/${item.briefing_date}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}

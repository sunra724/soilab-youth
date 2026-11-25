import { archive } from '@/lib/series-archive';
import { renderFeed } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  const base = archive.baseUrl.replace(/\/$/, '');
  const entries = archive.series.flatMap(series => series.entries.map(entry => ({
    title: entry.title, url: new URL(entry.canonicalPath || entry.path, base).href,
    description: entry.description, body: entry.body + (entry.notice ? `\n\n${entry.notice}` : ''),
    publishedAt: entry.archivedAt, category: series.title, sources: entry.sources,
    image: entry.cards[0] ? new URL(entry.cards[0].src, base).href : undefined,
  })));
  return new Response(renderFeed(entries, { title: archive.title, description: archive.description, url: `${base}/series`, feedUrl: `${base}/feed.xml` }), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  });
}

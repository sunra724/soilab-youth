import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { archive, getArchiveSeries, getArchiveEntry } from '@/lib/series-archive';
import { ArchiveArticle } from '@/components/series/Archive';
type Props = { params: Promise<{ slug: string; episode: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return archive.series.flatMap(series => series.entries.map(entry => ({ slug: series.slug, episode: String(entry.number) }))); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, episode } = await params;
  const series = getArchiveSeries(slug), entry = series && getArchiveEntry(series, episode);
  if (!entry) return {};
  const card = entry.cards[0], url = new URL(entry.canonicalPath || entry.path, archive.baseUrl).toString();
  return { title: entry.title, description: entry.description, alternates: { canonical: url },
    openGraph: { type: 'article', locale: 'ko_KR', title: entry.title, description: entry.description, url, publishedTime: `${entry.archivedAt}T00:00:00+09:00`, images: [{ url: new URL(card.src, archive.baseUrl).toString(), width: card.width, height: card.height, alt: entry.title }] },
    twitter: { card: 'summary_large_image', title: entry.title, description: entry.description, images: [new URL(card.src, archive.baseUrl).toString()] } };
}
export default async function EpisodePage({ params }: Props) {
  const { slug, episode } = await params;
  const series = getArchiveSeries(slug);
  if (!series) notFound();
  const entry = getArchiveEntry(series, episode);
  if (!entry) notFound();
  if (entry.canonicalPath) permanentRedirect(entry.href);
  return <ArchiveArticle series={series} entry={entry} />;
}

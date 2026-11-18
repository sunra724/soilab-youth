import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { archive, getArchiveSeries } from '@/lib/series-archive';
import { SeriesOverview } from '@/components/series/Archive';
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return archive.series.map(series => ({ slug: series.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const series = getArchiveSeries((await params).slug);
  if (!series) return {};
  const url = `${archive.baseUrl}/series/${series.slug}`;
  const card = series.entries[0].cards[0];
  return { title: series.title, description: series.description, alternates: { canonical: url },
    openGraph: { type: 'website', title: series.title, description: series.description, url, images: [{ url: new URL(card.src, archive.baseUrl).toString(), width: card.width, height: card.height, alt: series.title }] },
    twitter: { card: 'summary_large_image', title: series.title, description: series.description, images: [new URL(card.src, archive.baseUrl).toString()] } };
}
export default async function SeriesPage({ params }: Props) {
  const series = getArchiveSeries((await params).slug);
  if (!series) notFound();
  return <SeriesOverview series={series} />;
}

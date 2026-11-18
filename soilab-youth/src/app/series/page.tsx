import type { Metadata } from 'next';
import { archive } from '@/lib/series-archive';
import { ArchiveIndex } from '@/components/series/Archive';
export const metadata: Metadata = {
  title: archive.title, description: archive.description,
  alternates: { canonical: `${archive.baseUrl}/series` },
  twitter: { card: 'summary_large_image', title: archive.title, description: archive.description, images: [new URL(archive.series[0].entries[0].cards[0].src, archive.baseUrl).toString()] },
  openGraph: { title: archive.title, description: archive.description, url: `${archive.baseUrl}/series`, type: 'website', locale: 'ko_KR' },
};
export default function SeriesPage() { return <ArchiveIndex />; }

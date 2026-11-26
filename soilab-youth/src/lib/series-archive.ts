import data from '@/data/series-archive.json';

export type ArchiveCard = { src: string; alt: string; caption: string; width: number; height: number };
export type ArchiveReference = { label: string; href: string };
export type ArchiveEntry = {
  id: string; number: number; title: string; description: string; date: string;
  archivedAt: string; path: string; canonicalPath: string; href: string;
  cards: ArchiveCard[]; body: string; sources: ArchiveReference[];
  related: ArchiveReference[]; notice: string; download: string;
  contactLink?: ArchiveReference;
  videos: { src: string; label: string }[]; tags: string[];
};
export type ArchiveSeries = { slug: string; title: string; subtitle: string; description: string; entries: ArchiveEntry[] };
export type ArchiveCatalog = { site: string; baseUrl: string; title: string; description: string; series: ArchiveSeries[] };

export const archive = data as ArchiveCatalog;
export const getArchiveSeries = (slug: string) => archive.series.find(series => series.slug === slug);
export const getArchiveEntry = (series: ArchiveSeries, number: string) => series.entries.find(entry => String(entry.number) === number);
export const allArchiveEntries = () => archive.series.flatMap(series => series.entries);
export function sourceAttachment(path: string) {
  for (const series of archive.series) {
    const entry = series.entries.find(item => item.canonicalPath === path);
    if (entry) return { series, entry };
  }
}
export function archiveSitemapPaths() {
  return ['/series', ...archive.series.map(series => `/series/${series.slug}`), ...allArchiveEntries().filter(entry => !entry.canonicalPath).map(entry => entry.path)];
}

export function archiveLastModified(path: string) {
  const latest = (entries: ArchiveEntry[]) => entries.map(entry => entry.archivedAt).sort().at(-1);
  if (path === '/series') return latest(allArchiveEntries());
  for (const series of archive.series) {
    if (path === `/series/${series.slug}`) return latest(series.entries);
    const entry = series.entries.find(item => item.path === path);
    if (entry) return entry.archivedAt;
  }
}

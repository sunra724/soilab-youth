export const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

type FeedEntry = { title: string; url: string; description: string; body: string; publishedAt: string; category: string; image?: string; sources?: { label: string; href: string }[] };

export function renderFeed(entries: FeedEntry[], meta: { title: string; url: string; feedUrl: string; description: string }) {
  const items = entries.filter(item => Number.isFinite(Date.parse(item.publishedAt))).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const html = (item: FeedEntry) => [
    `<p>${escapeXml(item.description)}</p>`,
    ...item.body.split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p>${escapeXml(paragraph).replaceAll('\n', '<br />')}</p>`),
    ...(item.sources?.length ? ['<h2>참고자료</h2><ul>' + item.sources.map(source => `<li><a href="${escapeXml(source.href)}">${escapeXml(source.label)}</a></li>`).join('') + '</ul>'] : []),
    `<p><a href="${escapeXml(item.url)}">카드뉴스와 원문 보기</a></p>`,
  ].join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
<channel><title>${escapeXml(meta.title)}</title><link>${escapeXml(meta.url)}</link><description>${escapeXml(meta.description)}</description><language>ko-KR</language><atom:link href="${escapeXml(meta.feedUrl)}" rel="self" type="application/rss+xml" />${items[0] ? `<lastBuildDate>${new Date(items[0].publishedAt).toUTCString()}</lastBuildDate>` : ''}
${items.map(item => `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(item.url)}</link><guid isPermaLink="true">${escapeXml(item.url)}</guid><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate><category>${escapeXml(item.category)}</category><description>${escapeXml(html(item))}</description><content:encoded>${escapeXml(html(item))}</content:encoded>${item.image ? `<media:thumbnail url="${escapeXml(item.image)}" />` : ''}</item>`).join('\n')}
</channel></rss>`;
}

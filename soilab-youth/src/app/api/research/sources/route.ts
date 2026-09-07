import { getSourceCatalog } from '@/lib/research/catalog';
import { RESEARCH_REVIEW_DATE } from '@/data/research';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const catalog = await getSourceCatalog();
  if (new URL(request.url).searchParams.get('feed') === 'briefing') {
    if (!catalog.available) return Response.json({ error: 'source_database_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    const cutoff = Date.now() - 7 * 86400000;
    const items = catalog.approved.filter(row => row.reviewed_at && Date.parse(row.reviewed_at) >= cutoff).slice(0, 20).map(row => ({
      id: row.id, title: row.title, url: row.url, publisher: row.publisher,
      excerpt: `${row.summary}\n적용 방향: ${row.application}\n한계: ${row.limitation}`,
      publication_year: row.publication_year, published_at: row.published_at, effective_at: row.effective_at,
      reviewed_at: row.reviewed_at, checked_at: row.checked_at, review_scope: row.review_scope,
      scope: row.scope, tier: row.provider === 'law' ? 'official' : 'research', review_status: 'approved',
    }));
    return Response.json({ available: true, items }, { headers: { 'Cache-Control': 'no-store' } });
  }
  return Response.json({ reviewed_at: RESEARCH_REVIEW_DATE, available: catalog.available, items: catalog.items }, { headers: { 'Cache-Control': 'no-store' } });
}

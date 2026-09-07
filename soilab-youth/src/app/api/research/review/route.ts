import { authorized } from '@/lib/research/core';
import { parseSourceReview, type ReviewedSource } from '@/lib/research/source-core';
import { sourceDb } from '@/lib/research/source-store';

export const dynamic = 'force-dynamic';
function allowed(request: Request) { return authorized(request.headers.get('authorization'), process.env.YOUTH_RESEARCH_REVIEW_TOKEN); }
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: Request) {
  if (!allowed(request)) return reply({ error: '검토용 접속 키를 확인하세요.' }, 401);
  const params = new URL(request.url).searchParams;
  const status = params.get('status') || 'pending';
  const page = Number(params.get('page') || 0);
  if (!['pending', 'approved', 'excluded'].includes(status) || !Number.isInteger(page) || page < 0 || page > 1000) return reply({ error: '조회 조건이 올바르지 않습니다.' }, 400);
  try {
    const [items, runs] = await Promise.all([
      sourceDb<ReviewedSource[]>('youth_policy_sources', `select=*&review_status=eq.${status}&order=imported_at.desc,id.asc&limit=41&offset=${page * 40}`),
      sourceDb('youth_source_sync_runs', 'select=provider,started_at,finished_at,status,record_count,details&order=started_at.desc&limit=8'),
    ]);
    return reply({ items: items.slice(0, 40), hasMore: items.length > 40, runs });
  } catch { return reply({ error: '검토함 DB가 연결되지 않았습니다. 청년 정책자료 SQL 마이그레이션과 환경설정을 확인하세요.' }, 503); }
}

export async function PATCH(request: Request) {
  if (!allowed(request)) return reply({ error: '검토용 접속 키를 확인하세요.' }, 401);
  let input;
  try { input = parseSourceReview(await request.json()); }
  catch { return reply({ error: '공개하려면 요약·적용 방향·한계·확인 범위와 주제를 모두 입력하세요.' }, 400); }
  const { id, content_hash, ...fields } = input;
  try {
    const rows = await sourceDb<ReviewedSource[]>('youth_policy_sources', `id=eq.${id}&content_hash=eq.${content_hash}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...fields, reviewed_at: fields.review_status === 'pending' ? null : new Date().toISOString() }),
    });
    if (!rows.length) return reply({ error: '수집 자료가 갱신되었습니다. 목록을 새로 불러온 뒤 검토해 주세요.' }, 409);
    return reply({ item: rows[0] });
  } catch { return reply({ error: '검토 결과를 저장하지 못했습니다.' }, 503); }
}

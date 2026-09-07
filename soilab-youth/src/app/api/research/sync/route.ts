import { authorized } from '@/lib/research/core';
import { runSourceSync } from '@/lib/research/source-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;
async function sync(request: Request, token: string | undefined, minimumLength = 32) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!authorized(request.headers.get('authorization'), token, minimumLength)) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  const provider = new URL(request.url).searchParams.get('provider');
  if (provider !== 'nkis' && provider !== 'law') return Response.json({ error: 'Invalid provider' }, { status: 400, headers });
  try { return Response.json({ success: true, ...await runSourceSync(provider) }, { headers }); }
  catch { return Response.json({ error: '수집을 완료하지 못했습니다. DB 연결, API 설정과 검토함의 수집 기록을 확인하세요.' }, { status: 503, headers }); }
}
export function GET(request: Request) { return sync(request, process.env.CRON_SECRET); }
export function POST(request: Request) { return sync(request, process.env.YOUTH_RESEARCH_REVIEW_TOKEN); }

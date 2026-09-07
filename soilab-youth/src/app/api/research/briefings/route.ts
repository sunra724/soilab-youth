import { authorized, briefingIngestToken, parseBriefing, parseDelivery, validDate } from '@/lib/research/core';
import { researchDb, researchDbConfigured } from '@/lib/research/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function allowed(request: Request) {
  return authorized(request.headers.get('authorization'), briefingIngestToken());
}

async function body(request: Request) {
  const raw = await request.text();
  if (raw.length > 40000) throw new Error('payload_too_large');
  return JSON.parse(raw) as unknown;
}

export async function GET(request: Request) {
  if (!allowed(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!researchDbConfigured()) return Response.json({ error: 'archive_not_configured' }, { status: 503 });
  const date = new URL(request.url).searchParams.get('date');
  if (date && !validDate(date)) return Response.json({ error: 'invalid_date' }, { status: 400 });
  try {
    if (new URL(request.url).searchParams.get('history') === '30') {
      const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const rows = await researchDb<{ sources: { title: string }[] }[]>(`select=sources&briefing_date=gte.${since}&delivery_status=eq.delivered&order=briefing_date.desc&limit=31`);
      return Response.json({ success: true, titles: rows.flatMap(row => row.sources.map(source => source.title)) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const rows = await researchDb<unknown[]>(`select=briefing_date,delivery_status,body_text,sources,message_id&limit=1${date ? `&briefing_date=eq.${date}` : ''}`);
    return Response.json({ success: true, briefing: date ? rows[0] ?? null : null });
  } catch { return Response.json({ error: 'archive_unavailable' }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!allowed(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  let input;
  try { input = parseBriefing(await body(request)); }
  catch { return Response.json({ error: 'invalid_payload' }, { status: 400 }); }
  try {
    // The first saved edition is immutable: a rerun cannot change already delivered text.
    const rows = await researchDb<unknown[]>('on_conflict=briefing_date&select=briefing_date,delivery_status', {
      method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(input),
    });
    return Response.json({ success: true, created: rows.length > 0 });
  } catch { return Response.json({ error: 'archive_write_failed' }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  if (!allowed(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  let input;
  try { input = parseDelivery(await body(request)); }
  catch { return Response.json({ error: 'invalid_payload' }, { status: 400 }); }
  const claiming = input.action === 'claim';
  const previous = claiming ? 'in.(pending,failed)' : 'eq.sending';
  try {
    const rows = await researchDb<unknown[]>(`briefing_date=eq.${input.briefing_date}&delivery_status=${previous}&select=briefing_date,delivery_status,body_text`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ delivery_status: claiming ? 'sending' : input.action, message_id: input.message_id, updated_at: new Date().toISOString() }),
    });
    if (!rows.length) return Response.json({ error: 'delivery_state_conflict' }, { status: 409 });
    return Response.json({ success: true, briefing: rows[0] });
  } catch { return Response.json({ error: 'delivery_update_failed' }, { status: 503 }); }
}

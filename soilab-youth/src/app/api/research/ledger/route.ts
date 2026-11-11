import { authorized } from '@/lib/research/core';
import { flushLedger, ledgerEnabled, ledgerStatus } from '@/lib/research/ledger-bridge';
import { ledgerErrorCode } from '@/lib/research/ledger-core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 90;
const headers = { 'Cache-Control': 'no-store' };
export async function GET(request: Request) {
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  try { return Response.json(await ledgerStatus(), { headers }); }
  catch (error) { return Response.json({ error: ledgerErrorCode(error) }, { status: 503, headers }); }
}
export async function POST(request: Request) {
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  if (!ledgerEnabled()) return Response.json({ status: 'disabled' }, { headers });
  try { return Response.json(await flushLedger(), { headers }); }
  catch (error) { return Response.json({ error: ledgerErrorCode(error) }, { status: 503, headers }); }
}

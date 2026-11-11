import { after } from 'next/server';
import { authorized } from '@/lib/research/core';
import { briefingProperties, deliverDaily, prepareDailyDraft } from '@/lib/research/daily';
import { captureLedgerBatch, flushLedger, ledgerEnabled } from '@/lib/research/ledger-bridge';
import { ledgerErrorCode } from '@/lib/research/ledger-core';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (process.env.YOUTH_BRIEFING_ENABLED !== 'true' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production')) return Response.json({ status: 'disabled' }, { headers });
  const mirror = ledgerEnabled();
  if (mirror) after(async () => {
    try { console.info('[youth-ledger]', JSON.stringify(await flushLedger())); }
    catch (error) { console.error('[youth-ledger]', ledgerErrorCode(error)); }
  });
  try {
    const result = await deliverDaily(briefingProperties(), { fetcher: fetch, now: () => new Date(), draft: prepareDailyDraft,
      ...(mirror ? { onCollected: async batch => { await captureLedgerBatch(batch); },
        onCollectionError: () => console.error('[youth-ledger]', 'ledger_capture_failed') } : {}),
    });
    console.info('[youth-policy]', JSON.stringify(result));
    return Response.json(result, { headers });
  } catch (error) {
    const code = error instanceof Error && /^[a-z_0-9]+$/.test(error.message) ? error.message : 'briefing_failed';
    console.error('[youth-policy]', code);
    return Response.json({ error: code }, { status: 503, headers });
  }
}

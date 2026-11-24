import { after } from 'next/server';
import { authorized } from '@/lib/research/core';
import { briefingHistory, briefingProperties, deliverDaily, prepareDailyDraft, prepareQualityDraft } from '@/lib/research/daily';
import { captureLedgerBatch, flushLedger, ledgerEnabled } from '@/lib/research/ledger-bridge';
import { ledgerErrorCode } from '@/lib/research/ledger-core';

export const dynamic = 'force-dynamic';
export const maxDuration = 180;
export const runtime = 'nodejs';

// Exercise the production-only key without entering the delivery path.
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!authorized(request.headers.get('authorization'), process.env.CRON_SECRET)) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  try {
    const props = briefingProperties({ preview: true });
    const history = await briefingHistory(props, fetch);
    const { briefing, audit } = await prepareQualityDraft(props, history.titles, {
      fetcher: fetch, now: () => new Date(), draft: prepareDailyDraft, history: history.items,
    });
    const status = !briefing.sources.length && audit.editorial_checks.length ? 503 : 200;
    return Response.json({ preview: true, stored: false, sent: false, briefing, sourceChecks: audit.source_checks.map(check => check.reason),
      editorialChecks: audit.editorial_checks.map(check => check.reason), collectionFailures: audit.collection_failures }, { status, headers });
  } catch (error) {
    const code = error instanceof Error && /^[a-z_0-9]+$/.test(error.message) ? error.message : 'briefing_preview_failed';
    return Response.json({ error: code }, { status: 503, headers });
  }
}

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

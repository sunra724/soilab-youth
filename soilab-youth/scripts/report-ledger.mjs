// Run from the actual Vercel app directory; use Node --env-file or configured environment.
import { captureLedgerBatch, flushLedger, ledgerStatus } from '../src/lib/research/ledger-bridge.ts';
import { ledgerErrorCode } from '../src/lib/research/ledger-core.ts';

const args = process.argv.slice(2);
try {
  if (args.length === 1 && args[0] === '--status') {
    console.log(JSON.stringify(await ledgerStatus(), null, 2));
  } else if (args.length === 1 && args[0] === '--flush') {
    console.log(JSON.stringify(await flushLedger(), null, 2));
  } else if (args.length >= 1 && args.length <= 2 && /^--backfill=(?:[1-9]|[1-5][0-9]|60)$/.test(args[0]) && (!args[1] || args[1] === '--apply')) {
    const days = Number(args[0].split('=')[1]);
    const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('ledger_database_not_configured');
    const started_at = new Date().toISOString();
    const since = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date(Date.now() - (days - 1) * 86400000));
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
    const query = new URLSearchParams({ select: 'sources', visibility: 'eq.public',
      and: '(briefing_date.gte.' + since + ',briefing_date.lte.' + today + ')', limit: '60' });
    const response = await fetch(url + '/rest/v1/youth_policy_briefings?' + query, {
      headers: { apikey: key, Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('ledger_database_http_' + response.status);
    const archive = await response.json();
    if (!Array.isArray(archive)) throw new Error('ledger_database_invalid_response');
    const items = archive.flatMap(row => row.sources || []);
    const batch = { items, started_at, finished_at: new Date().toISOString(),
      sources: [{ id: 'archive_backfill', source_type: 'manual', status: 'success', item_count: items.length }] };
    console.log(JSON.stringify(args[1] === '--apply' ? await captureLedgerBatch(batch)
      : { status: 'dry_run', briefings: archive.length, sourceReferences: items.length, wrote: false }, null, 2));
  } else {
    console.error('Usage: node scripts/report-ledger.mjs --status | --flush | --backfill=10 [--apply]');
    process.exitCode = 2;
  }
} catch (error) {
  console.error(ledgerErrorCode(error));
  process.exitCode = 1;
}

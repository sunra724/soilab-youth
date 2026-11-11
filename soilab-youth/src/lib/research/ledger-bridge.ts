// Server/CLI only: the public briefing archive never queries this queue.
import { randomUUID } from 'node:crypto';
import { ledgerErrorCode, queueEntries, type CollectedBatch, type PendingEntry } from './ledger-core.ts';
import { createSheetsClient, sheetsCredentialsAvailable } from './ledger-sheets.ts';
type Env = Record<string, string | undefined>;
export type LedgerRuntime = { env?: Env; fetcher?: typeof fetch; now?: () => Date };
type Rpc = 'enqueue' | 'claim' | 'ack' | 'release' | 'status';
export function ledgerEnabled(env: Env = process.env) {
  return env.YOUTH_LEDGER_ENABLED === 'true' && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production');
}
export async function ledgerRpc<T>(method: Rpc, payload = {}, runtime: LedgerRuntime = {}): Promise<T> {
  const env = runtime.env || process.env;
  const url = env.SUPABASE_URL?.replace(/\/$/, '');
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('ledger_database_not_configured');
  let response: Response;
  try { response = await (runtime.fetcher || fetch)(url + '/rest/v1/rpc/youth_ledger_' + method, {
    method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), cache: 'no-store', signal: AbortSignal.timeout(10000),
  }); } catch { throw new Error('ledger_database_unavailable'); }
  if (!response.ok) throw new Error('ledger_database_http_' + response.status);
  const raw = await response.text();
  try { return (raw ? JSON.parse(raw) : undefined) as T; }
  catch { throw new Error('ledger_database_invalid_response'); }
}
export async function captureLedgerBatch(batch: CollectedBatch, runtime: LedgerRuntime = {}) {
  if (!ledgerEnabled(runtime.env)) return { status: 'disabled', queued: 0 };
  const entries = queueEntries(batch);
  let queued = 0;
  for (let start = 0; start < entries.length; start += 250) {
    queued += await ledgerRpc<number>('enqueue', { _batch: entries.slice(start, start + 250) }, runtime);
  }
  return { status: 'buffered', queued };
}
export async function ledgerStatus(runtime: LedgerRuntime = {}) {
  const env = runtime.env || process.env;
  const status = await ledgerRpc<Record<string, number>>('status', {}, runtime);
  return { enabled: ledgerEnabled(env), googleConfigured: sheetsCredentialsAvailable(env), ...status };
}
export async function flushLedger(runtime: LedgerRuntime = {}) {
  const env = runtime.env || process.env;
  if (!ledgerEnabled(env)) return { status: 'disabled', synced: 0 };
  if (!sheetsCredentialsAvailable(env)) return { status: 'awaiting_google_credentials', synced: 0 };
  const now = runtime.now || (() => new Date());
  const started = now().getTime();
  const sheets = createSheetsClient(env, runtime.fetcher || fetch, now);
  let synced = 0;
  for (let batch = 0; batch < 3 && now().getTime() - started < 45000; batch++) {
    const token = randomUUID();
    const pending = await ledgerRpc<PendingEntry[]>('claim', { _token: token, _limit: 100 }, runtime);
    if (!Array.isArray(pending)) throw new Error('ledger_database_invalid_response');
    if (!pending.length) {
      if (!synced) await sheets.write([]); // Verify the connection even on an empty queue.
      break;
    }
    try {
      await sheets.write(pending);
      const acked = await ledgerRpc<number>('ack', { _token: token, _rows: pending.map(entry => entry.sheet_row) }, runtime);
      if (acked !== pending.length) throw new Error('ledger_lease_changed');
      synced += acked;
    } catch (error) {
      await ledgerRpc('release', { _token: token, _code: ledgerErrorCode(error) }, runtime).catch(() => {});
      throw new Error(ledgerErrorCode(error));
    }
  }
  return { status: 'synced', synced };
}

// Private server/CLI data contract. Never import this module into a client component.
import { createHash, randomUUID } from 'node:crypto';

export const ITEM_HEADERS = ['item_id', 'dedupe_key', 'collected_at', 'published_at', 'source_type', 'source_name', 'title', 'url', 'url_status', 'is_overseas', 'country', 'region_sido', 'region_sigungu', 'item_type', 'target_groups', 'stage_tags', 'q_codes', 'numbers', 'fact_summary', 'meaning', 'ledger_flag', 'ledger_reason', 'briefing_date', 'sent', 'skip_reason'];
export const RUN_HEADERS = ['run_id', 'source_type', 'started_at', 'finished_at', 'status', 'item_count', 'last_success_at', 'error_code'];
export type SourceType = 'news' | 'nkis' | 'prism' | 'g2b' | 'law' | 'press' | 'manual';
export type LedgerCandidate = { title: string; url: string; publisher: string; checked_at: string; published_at?: string | null; feed_kind?: string };
export type CollectionSource = { id: string; source_type: SourceType; status: 'success' | 'failed'; item_count: number };
export type CollectedBatch = { items: LedgerCandidate[]; sources: CollectionSource[]; started_at: string; finished_at: string };
export type QueueEntry = { target: 'items' | 'source_runs'; dedupe_key: string; payload: Record<string, unknown> };
export type PendingEntry = QueueEntry & { sheet_row: number };

export function ledgerErrorCode(error: unknown) {
  return error instanceof Error && /^ledger_[a-z0-9_]{1,70}$/.test(error.message) ? error.message : 'ledger_failed';
}

export function canonicalLedgerUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || value.length > 1600
      || !url.hostname.includes('.') || /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[)/i.test(url.hostname)
      || /^172\.(?:1[6-9]|2\d|3[01])\./.test(url.hostname)) return null;
    for (const name of [...url.searchParams.keys()]) {
      if (/^(?:utm_.+|fbclid|gclid|dclid|mc_cid|mc_eid|igshid|_ga)$/i.test(name)) url.searchParams.delete(name);
      // Do not archive a credential-bearing source URL.
      else if (/^(?:access_token|api_key|apikey|servicekey|authorization|secret|password)$/i.test(name)) return null;
    }
    url.hash = '';
    url.searchParams.sort();
    return url.toString();
  } catch { return null; }
}

export const ledgerHash = (text: string) => createHash('sha1').update(text).digest('hex');
const clean = (value: string, max: number) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
function sourceType(item: LedgerCandidate): SourceType {
  const host = new URL(item.url).hostname;
  if (/(^|\.)nkis\.re\.kr$/.test(host)) return 'nkis';
  if (/(^|\.)law\.go\.kr$/.test(host)) return 'law';
  if (/(^|\.)mohw\.go\.kr$/.test(host)) return 'press';
  return item.feed_kind === 'reviewed_reading' ? 'manual' : 'news';
}
function validTimestamp(value: string) {
  if (!Number.isFinite(Date.parse(value))) throw new Error('ledger_invalid_timestamp');
  return new Date(value).toISOString();
}

export function queueEntries(batch: CollectedBatch, runId = randomUUID()): QueueEntry[] {
  const entries = new Map<string, QueueEntry>();
  for (const item of batch.items) {
    const url = canonicalLedgerUrl(item.url);
    const title = clean(item.title, 240);
    if (!url || !title) continue;
    const dedupe_key = ledgerHash(url);
    if (entries.has(dedupe_key)) continue;
    entries.set(dedupe_key, { target: 'items', dedupe_key, payload: {
      collected_at: validTimestamp(item.checked_at), source_type: sourceType({ ...item, url }),
      source_name: clean(item.publisher, 150), title, url,
      // RSS pubDate is not a verified original publication date. Do not promote it here.
    } });
  }
  const started_at = validTimestamp(batch.started_at);
  const finished_at = validTimestamp(batch.finished_at);
  const runs = batch.sources.map(source => ({
    target: 'source_runs' as const, dedupe_key: ledgerHash(runId + ':' + source.id),
    payload: { run_id: runId + ':' + clean(source.id, 40), source_type: source.source_type,
      started_at, finished_at, status: source.status, item_count: source.item_count,
      last_success_at: source.status === 'success' ? finished_at : null,
      error_code: source.status === 'failed' ? 'source_fetch_failed' : '' },
  }));
  return [...entries.values(), ...runs];
}

// Google dates are serial days in the spreadsheet's configured local timezone.
export function sheetKstTimestamp(value: unknown) {
  const parsed = Date.parse(String(value));
  if (!Number.isFinite(parsed)) throw new Error('ledger_invalid_timestamp');
  return parsed / 86400000 + 25569 + 9 / 24;
}
export function ledgerItemId(entry: PendingEntry) {
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(String(entry.payload.collected_at))).replaceAll('-', '');
  return date + '-' + String(entry.sheet_row - 1).padStart(3, '0');
}
export function entryIdentity(entry: PendingEntry) {
  return entry.target === 'items' ? ledgerItemId(entry) : String(entry.payload.run_id);
}
type Cell = { userEnteredValue?: { stringValue?: string; numberValue?: number; boolValue?: boolean }; userEnteredFormat?: Record<string, unknown> };
function cell(value: unknown): Cell {
  if (value === null || value === undefined || value === '') return {};
  // Use stringValue, never formulaValue: spreadsheet formulas in source titles stay inert.
  return { userEnteredValue: typeof value === 'number' ? { numberValue: value } : { stringValue: String(value) } };
}
export function entryWrites(entry: PendingEntry, sheetId: number) {
  const rowIndex = entry.sheet_row - 1;
  const write = (startColumnIndex: number, values: unknown[]) => ({ updateCells: {
    range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex, endColumnIndex: startColumnIndex + values.length },
    rows: [{ values: values.map(cell) }], fields: 'userEnteredValue',
  } });
  const p = entry.payload;
  const timestamp = (startColumnIndex: number, value: unknown) => {
    const request = write(startColumnIndex, [sheetKstTimestamp(value)]);
    request.updateCells.rows[0].values[0].userEnteredFormat = { numberFormat: { type: 'DATE_TIME', pattern: 'yyyy-mm-dd hh:mm' } };
    request.updateCells.fields = 'userEnteredValue,userEnteredFormat.numberFormat';
    return request;
  };
  if (entry.target === 'items') return [
    write(0, [entryIdentity(entry), entry.dedupe_key]),
    timestamp(2, p.collected_at),
    // Leave publication date and every human classification/review column alone.
    write(4, [p.source_type, p.source_name, p.title, p.url]),
    write(24, ['source_verification_pending']),
  ];
  const requests = [write(0, [p.run_id, p.source_type]), timestamp(2, p.started_at), timestamp(3, p.finished_at),
    write(4, [p.status, p.item_count]), write(7, [p.error_code])];
  if (p.last_success_at) requests.push(timestamp(6, p.last_success_at));
  return requests;
}

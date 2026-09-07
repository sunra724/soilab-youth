// Server/CLI module. Never import into a client component.
import { collectSources, type Collection } from './collectors.ts';
import type { Provider, ReviewedSource } from './source-core.ts';

export async function sourceDb<T>(table: 'youth_policy_sources' | 'youth_source_sync_runs', query: string, init: RequestInit = {}): Promise<T> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('research_not_configured');
  const headers = new Headers(init.headers);
  headers.set('apikey', key); headers.set('Authorization', `Bearer ${key}`); headers.set('Content-Type', 'application/json');
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, { ...init, headers, cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`research_database_${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
}

export async function runSourceSync(provider: Provider) {
  await sourceDb<ReviewedSource[]>('youth_policy_sources', 'select=id&limit=1');
  const started_at = new Date().toISOString();
  let collection: Collection;
  try {
    collection = await collectSources(provider);
    if (collection.records.length) await sourceDb('youth_policy_sources', 'on_conflict=id', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(collection.records),
    });
  } catch {
    await sourceDb('youth_source_sync_runs', '', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ provider, started_at, status: 'failed', record_count: 0, details: { error: '조회 또는 저장 실패. API 설정과 DB 연결을 확인하세요.' } }) }).catch(() => {});
    throw new Error('research_sync_failed');
  }
  const { records, ...details } = collection;
  const status = details.failures.length || details.detailFailures || details.truncated.length ? 'partial' : 'success';
  const summary = { provider, started_at, status, record_count: records.length, details };
  await sourceDb('youth_source_sync_runs', '', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(summary) });
  return summary;
}

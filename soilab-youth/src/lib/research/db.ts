import 'server-only';
import type { Briefing } from './core';

export function researchDbConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export async function researchDb<T>(query: string, init: RequestInit = {}): Promise<T> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('research_not_configured');
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Authorization', `Bearer ${key}`);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(`${url}/rest/v1/youth_policy_briefings?${query}`, { ...init, headers, cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`research_database_${response.status}`);
  return await response.json() as T;
}

export async function getBriefings(date?: string): Promise<{ items: Briefing[]; available: boolean }> {
  if (!researchDbConfigured()) return { items: [], available: false };
  try {
    const query = `select=briefing_date,title,summary,body_text,sources,generator_model,delivery_status,message_id,published_at&visibility=eq.public&order=briefing_date.desc&limit=60${date ? `&briefing_date=eq.${encodeURIComponent(date)}` : ''}`;
    return { items: await researchDb<Briefing[]>(query), available: true };
  } catch {
    return { items: [], available: false };
  }
}

export async function getBriefingSitemapEntries(): Promise<Pick<Briefing, 'briefing_date'>[]> {
  if (!researchDbConfigured()) return [];

  const entries: Pick<Briefing, 'briefing_date'>[] = [];
  const pageSize = 100;
  for (let offset = 0; ; offset += pageSize) {
    const page = await researchDb<Pick<Briefing, 'briefing_date'>[]>(
      `select=briefing_date&visibility=eq.public&order=briefing_date.asc&limit=${pageSize}&offset=${offset}`,
    );
    entries.push(...page);
    if (page.length < pageSize) return entries;
  }
}

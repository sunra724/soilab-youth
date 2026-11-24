import { XMLParser } from 'fast-xml-parser';
import { publicUrl, parseBriefing, briefingIngestToken, type Briefing, type BriefingInput } from './core.ts';
import { collapseRelatedNews } from '../newsletterDedupe.ts';
import { enrichBriefingSources, seenBriefingStory, sourceTier, type BriefingCandidate, type EvidenceRuntime } from './briefing-evidence.ts';
import { composeEvidenceBriefing, editEvidenceSource } from './briefing-editor.ts';
import { crisisYouthPolicyScope, YOUTH_POLICY_DOMESTIC_FEEDS } from './briefing-scope.ts';
import type { CollectedBatch, SourceType } from './ledger-core.ts';

type Candidate = BriefingCandidate;
type Properties = { api: string; ingest: string; bot: string; chat: string; openaiKey: string; model: string };
export type DailyRuntime = EvidenceRuntime & {
  draft: (props: Properties, seen: string[], runtime: DailyRuntime) => Promise<BriefingInput>;
  history?: { title: string; url?: string }[];
  candidates?: Candidate[];
  onAiOutput?: (output: unknown) => void;
  onCollected?: (batch: CollectedBatch) => Promise<void>;
  onCollectionError?: () => void;
};
const clean = (v: unknown) => String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
export const koreaDate = (now: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function briefingProperties(options: { preview?: boolean } = {}): Properties {
  const props = {
    api: 'https://www.soilab-youth.kr/api/research/briefings',
    ingest: briefingIngestToken() || '',
    bot: process.env.YOUTH_BRIEFING_BOT_TOKEN || '',
    chat: process.env.YOUTH_BRIEFING_CHAT_ID || '',
    openaiKey: process.env.OPENAI_API_KEY?.trim() || '',
    model: process.env.YOUTH_BRIEFING_OPENAI_MODEL?.trim() || 'gpt-4.1-mini',
  };
  if (!props.openaiKey) throw new Error('openai_key_missing');
  if (!options.preview && (!props.bot || !props.chat || props.ingest.length < 32)) throw new Error('briefing_not_configured');
  return props;
}

export function briefingRelevant(value: string) {
  return crisisYouthPolicyScope(value)
    || /고립[\s·ㆍ‧・,\/]*(?:및\s*)?은둔|ひきこもり|hikikomori|孤独|孤立|loneliness|social isolation/i.test(value.normalize('NFKC'));
}
function tier(url: string): Candidate['tier'] {
  return sourceTier(url);
}
export async function collectDailyCandidates(props: Properties, seenTitles: string[], runtime: DailyRuntime) {
  const started_at = runtime.now().toISOString();
  const google = (query: string, locale: string) => `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:3d')}&${locale}`;
  const feeds = [
    { id: 'mohw', source_type: 'press' as SourceType, name: '보건복지부', url: 'https://www.mohw.go.kr/rss/board.es?mid=a10503000000&bid=0027&info' },
    ...YOUTH_POLICY_DOMESTIC_FEEDS.map(feed => ({ id: feed.id, source_type: 'news' as SourceType, name: feed.name,
      url: google(feed.query, 'hl=ko&gl=KR&ceid=KR:ko') })),
    { id: 'jp', source_type: 'news' as SourceType, name: '일본 정책 동향', url: google('(ひきこもり OR 孤独・孤立) (支援 OR 政策 OR 調査)', 'hl=ja&gl=JP&ceid=JP:ja') },
    { id: 'uk', source_type: 'news' as SourceType, name: '영국 정책 동향', url: google('loneliness (youth OR "young people" OR policy) UK', 'hl=en-GB&gl=GB&ceid=GB:en') },
  ];
  const now = runtime.now().getTime();
  const cutoff = now - 72 * 3600000;
  const results = await Promise.allSettled(feeds.map(async feed => {
    const response = await runtime.fetcher(feed.url, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('feed_http');
    const parsed = new XMLParser({ parseTagValue: false }).parse(await response.text());
    if (!parsed.rss?.channel) throw new Error('feed_format');
    const rows = parsed.rss.channel.item || [];
    return (Array.isArray(rows) ? rows : [rows]).slice(0, 35).flatMap(row => {
      const title = clean(row.title).slice(0, 240);
      // Google RSS descriptions can be a cluster of unrelated article links, not this article's abstract.
      const headlineOnly = new URL(feed.url).hostname === 'news.google.com';
      const excerpt = headlineOnly ? title : clean(row.description).slice(0, 1500);
      const url = publicUrl(row.link); const date = Date.parse(row.pubDate);
      if (!url || !Number.isFinite(date) || date < cutoff || date > now + 3600000 || !briefingRelevant(title + ' ' + excerpt)) return [];
      return [{ title, excerpt, url, publisher: clean(row.source?.['#text'] || row.source || feed.name).slice(0, 140), tier: tier(url), checked_at: runtime.now().toISOString(), published_at: new Date(date).toISOString(), feed_kind: headlineOnly ? 'headline_only' : 'rss_excerpt' } satisfies Candidate];
    });
  }));
  const failures = results.flatMap((result, i) => result.status === 'rejected' ? [feeds[i].name] : []);
  const rss: Candidate[] = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  let readings: Candidate[] = [];
  let available = false;
  try {
    const response = await runtime.fetcher(props.api.replace(/\/briefings$/, '/sources?feed=briefing'), { cache: 'no-store', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('catalog_http');
    const data = await response.json();
    if (!data.available || !Array.isArray(data.items)) throw new Error('catalog_format');
    available = true;
    readings = data.items.filter((item: Candidate & { review_status: string }) => item.review_status === 'approved' && publicUrl(item.url) && Date.parse(item.reviewed_at || '') >= now - 7 * 86400000 && Date.parse(item.reviewed_at || '') <= now).map((item: Candidate) => ({ ...item, title: clean(item.title).slice(0, 240), excerpt: clean(item.excerpt).slice(0, 2500), feed_kind: 'reviewed_reading' }));
  } catch { failures.push('정책·연구 검토자료'); }
  // Save every eligible collected candidate before title/history/event filtering.
  // Mirror problems must never change the existing briefing's result.
  if (runtime.onCollected) {
    try {
      await runtime.onCollected({ items: [...readings, ...rss], started_at, finished_at: runtime.now().toISOString(),
        sources: [...results.map((result, i) => ({ id: feeds[i].id, source_type: feeds[i].source_type,
          status: result.status === 'fulfilled' ? 'success' as const : 'failed' as const,
          item_count: result.status === 'fulfilled' ? result.value.length : 0 })),
        { id: 'reviewed_catalog', source_type: 'manual', status: available ? 'success' : 'failed', item_count: readings.length }],
      });
    } catch { runtime.onCollectionError?.(); }
  }
  if (!available && failures.length === feeds.length + 1) throw new Error('all_sources_failed');
  const seen = seenTitles.map(title => ({ title }));
  const dedup = (items: Candidate[]) => items.filter(item => {
    if (seenBriefingStory(item, seen)) return false;
    seen.push({ title: item.title });
    return true;
  });
  const reading = dedup(readings).slice(0, 2);
  const rank = { official: 3, research: 2, news: 1 };
  const news = collapseRelatedNews(dedup(rss.sort((a, b) => rank[b.tier] - rank[a.tier] || Date.parse(b.published_at || '') - Date.parse(a.published_at || ''))));
  return { items: [...reading, ...news.slice(0, 10 - reading.length)], failures };
}

async function requestEditorialJson(props: Properties, runtime: DailyRuntime, instructions: string, payload: unknown, maxTokens = 1000) {
  const response = await runtime.fetcher('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${props.openaiKey}` },
    body: JSON.stringify({
      model: props.model, instructions, input: JSON.stringify(payload), store: false,
      max_output_tokens: maxTokens, text: { format: { type: 'json_object' } },
    }),
    signal: AbortSignal.timeout(40000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    if (error?.error?.code === 'insufficient_quota') throw new Error('openai_insufficient_quota');
    throw new Error(`openai_http_${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'completed' || !Array.isArray(data.output)) throw new Error('openai_incomplete');
  const parts: string[] = [];
  for (const item of data.output) {
    if (item.type !== 'message' || item.role !== 'assistant') continue;
    for (const part of item.content) {
      if (part.type === 'refusal') throw new Error('openai_refusal');
      if (part.type === 'output_text') parts.push(part.text);
    }
  }
  let result: unknown;
  try { result = JSON.parse(parts.join('')); }
  catch { throw new Error('openai_invalid_json'); }
  runtime.onAiOutput?.(result);
  return result;
}
export async function prepareQualityDraft(props: Properties, seen: string[], runtime: DailyRuntime) {
  const collected = runtime.candidates ? { items: runtime.candidates, failures: [] as string[] }
    : await collectDailyCandidates(props, seen, runtime);
  const history = [...seen.map(title => ({ title })), ...(runtime.history || [])];
  const evidence = await enrichBriefingSources(collected.items, runtime, history);
  const results = await Promise.allSettled(evidence.sources.map(async source => ({
    source,
    note: await editEvidenceSource(source, (system, input, maxTokens) => requestEditorialJson(props, runtime, system, input, maxTokens)),
  })));
  const notes = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
  const editorialChecks = results.map((result, index) => ({
    url: evidence.sources[index].url,
    status: result.status === 'fulfilled' ? 'accepted' : 'excluded',
    reason: result.status === 'fulfilled' ? 'evidence_and_review_passed'
      : result.reason instanceof Error && /^[a-z_0-9]+$/.test(result.reason.message)
        ? result.reason.message : 'editor_failed',
  }));
  const briefing = composeEvidenceBriefing(koreaDate(runtime.now()), notes, props.model);
  return { briefing, notes, audit: {
    generated_at: runtime.now().toISOString(), collection_failures: collected.failures,
    source_checks: evidence.checks, editorial_checks: editorialChecks,
    selected_sources: briefing.sources.length, stored: false, sent: false,
  } };
}

export async function prepareDailyDraft(props: Properties, seen: string[], runtime: DailyRuntime): Promise<BriefingInput> {
  const result = await prepareQualityDraft(props, seen, runtime);
  if (result.audit.editorial_checks.length && !result.briefing.sources.length) {
    const reasons = result.audit.editorial_checks.map(check => check.reason);
    console.warn('[youth-policy] editorial exclusions', reasons);
    const providerError = reasons.find(reason => reason.startsWith('openai_'));
    throw new Error(providerError || 'all_editorial_checks_failed');
  }
  return result.briefing;
}

export async function briefingHistory(props: Properties, fetcher: typeof fetch) {
  const response = await fetcher(props.api + '?history=30', {
    method: 'GET', headers: { Authorization: `Bearer ${props.ingest}` }, cache: 'no-store', signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error('briefing_archive_unavailable');
  const history = await response.json();
  if (!Array.isArray(history.titles)) throw new Error('briefing_history_unavailable');
  return { titles: history.titles as string[], items: Array.isArray(history.items) ? history.items : [] };
}

export async function deliverDaily(props: Properties, runtime: DailyRuntime) {
  const date = koreaDate(runtime.now());
  async function api(method: string, payload?: unknown, query = '') {
    const response = await runtime.fetcher(props.api + query, { method, headers: { Authorization: `Bearer ${props.ingest}`, 'Content-Type': 'application/json' }, body: payload ? JSON.stringify(payload) : undefined, cache: 'no-store', signal: AbortSignal.timeout(12000) });
    if (response.status === 409) return { conflict: true };
    if (!response.ok) throw new Error('briefing_archive_unavailable');
    return response.json();
  }
  let row: Briefing | undefined = (await api('GET', undefined, '?date=' + date)).briefing;
  if (row && ['delivered', 'sending', 'uncertain'].includes(row.delivery_status)) return { status: 'skipped', date, reason: row.delivery_status };
  if (!row) {
    const history = await briefingHistory(props, runtime.fetcher);
    const draft = parseBriefing(await runtime.draft(props, history.titles, { ...runtime, history: history.items }));
    if (draft.briefing_date !== date) throw new Error('briefing_date_changed');
    if (!draft.sources.length) return { status: 'skipped', date, reason: 'no_eligible_sources' };
    await api('POST', draft);
    row = (await api('GET', undefined, '?date=' + date)).briefing;
  }
  if (!row) throw new Error('briefing_missing');
  const claim = await api('PATCH', { briefing_date: date, action: 'claim' });
  if (claim.conflict) return { status: 'skipped', date, reason: 'already_claimed' };
  let response: Response;
  try {
    response = await runtime.fetcher(`https://api.telegram.org/bot${props.bot}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: props.chat, text: claim.briefing.body_text, link_preview_options: { is_disabled: true } }), signal: AbortSignal.timeout(15000) });
  } catch {
    await api('PATCH', { briefing_date: date, action: 'uncertain' }).catch(() => {});
    throw new Error('telegram_result_uncertain');
  }
  const payload = await response.json().catch(() => null);
  if (!payload?.ok || !Number.isSafeInteger(payload.result?.message_id)) {
    const action = payload?.ok === false && response.status < 500 ? 'failed' : 'uncertain';
    await api('PATCH', { briefing_date: date, action }).catch(() => {});
    throw new Error(action === 'failed' ? 'telegram_rejected' : 'telegram_result_uncertain');
  }
  const message_id = payload.result.message_id;
  try {
    const acknowledged = await api('PATCH', { briefing_date: date, action: 'delivered', message_id });
    if (acknowledged.conflict) return { status: 'sent-status-unconfirmed', date, message_id };
  }
  catch { return { status: 'sent-status-unconfirmed', date, message_id }; } // Leave sending in place; never resend.
  return { status: 'delivered', date, message_id };
}

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { load } from 'cheerio';
import { canonicalPublisherUrl, decodeGoogleNewsUrls, isGoogleNewsUrl } from '../googleNews.ts';
import { isSameNewsStory, newsStoryTokens } from '../newsletterDedupe.ts';
import { publicUrl } from './core.ts';
import { crisisYouthPolicyScope } from './briefing-scope.ts';

export type BriefingCandidate = {
  title: string; url: string; publisher: string; excerpt: string;
  tier: 'official' | 'research' | 'news'; checked_at: string; published_at: string | null;
  publication_year?: number | null; reviewed_at?: string; review_scope?: string;
  scope?: string; feed_kind?: string;
};
export type ReadSource = BriefingCandidate & {
  evidence_text: string;
  evidence_scope: 'article_body' | 'reviewed_excerpt';
  evidence_truncated?: boolean;
  retrieved_at: string;
};
export type EvidenceRuntime = {
  fetcher: typeof fetch;
  now: () => Date;
  resolveHost?: (hostname: string) => Promise<string[]>;
};
export type SourceCheck = { title: string; url: string; status: 'read' | 'excluded'; reason: string };
const MAX_BYTES = 1_500_000;
// Normalize whitespace and typographic quotation marks, never words or numbers.
export const normalizeEvidence = (text: string) => text.normalize('NFKC')
  .replace(/[\u2018\u2019]/gu, "'").replace(/[\u201c\u201d]/gu, '"').replace(/\s+/gu, ' ').trim();

export function publicAddress(address: string): boolean {
  const value = address.toLowerCase();
  if (value.startsWith('::ffff:')) return publicAddress(value.slice(7));
  if (isIP(value) === 4) {
    const [a, b] = value.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168))
      || (a === 198 && (b === 18 || b === 19)));
  }
  return isIP(value) === 6 && !/^(?:::|f[cd]|fe[89ab]|ff|2001:db8)/iu.test(value);
}

async function checkedUrl(value: string, runtime: EvidenceRuntime) {
  const safe = publicUrl(value);
  if (!safe) throw new Error('unsafe_source_url');
  const url = new URL(safe);
  if ((url.port && !['80', '443'].includes(url.port)) || /\.(local|internal|localhost)$/iu.test(url.hostname)) {
    throw new Error('unsafe_source_url');
  }
  const hostname = url.hostname.replace(/^\[|\]$/gu, '');
  const addresses = isIP(hostname) ? [hostname] : await (runtime.resolveHost
    ? runtime.resolveHost(hostname)
    : lookup(hostname, { all: true }).then(rows => rows.map(row => row.address)));
  if (!addresses.length || addresses.some(address => !publicAddress(address))) throw new Error('unsafe_source_address');
  return url.toString();
}

async function boundedBody(response: Response) {
  if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('source_too_large');
  if (!response.body) throw new Error('empty_source_body');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error('source_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const charset = /charset\s*=\s*["']?([^;\s"']+)/iu.exec(response.headers.get('content-type') || '')?.[1];
  return new TextDecoder(charset || 'utf-8').decode(bytes);
}

export function extractArticleBody(html: string) {
  const $ = load(html);
  const title = normalizeEvidence($('meta[property="og:title"]').attr('content') || $('h1').first().text() || $('title').text());
  $('script,style,noscript,nav,header,footer,aside,form,iframe,.related,.related-news,.share,.board_btns,.copyright,.comment,.swiper,.swiper-controls,.gallery_view button').remove();
  $('br').replaceWith('\n');
  $('p,li,tr,h1,h2,h3').append('\n');
  const selectors = [
    '[itemprop="articleBody"]', '#article-view-content-div', '#newsEndContents', '#articleBody',
    '.article-body', '.article_body', '.news_body', '.view_cont', '.view_con', '.view-content',
    '.board_view .contents', '.board_view .cont', '.gallery_view', '#bo_v_con', 'article',
  ];
  for (const selector of selectors) {
    for (const element of $(selector).toArray()) {
      const text = normalizeEvidence($(element).text());
      if (text.length >= 240) return { title, text: text.slice(0, 18_000), truncated: text.length > 18_000, selector };
    }
  }
  // A meta description or a whole page containing navigation is not an article.
  throw new Error('article_body_not_found');
}

export function youthPolicyScope(value: string) {
  const text = normalizeEvidence(value);
  return crisisYouthPolicyScope(text)
    || /(?:청년|청소년|아동).{0,80}(?:고립|은둔|가족\s*돌봄)|(?:고립|은둔|가족\s*돌봄).{0,80}(?:청년|청소년|아동)/iu.test(text)
    || (/(?:youth|young people|young adults|若者|若年)/iu.test(text)
      && /(?:loneliness|social isolation|hikikomori|ひきこもり|孤立|孤独)/iu.test(text));
}

export function sourceTier(value: string): BriefingCandidate['tier'] {
  const host = new URL(value).hostname.toLowerCase();
  if (/(?:\.go\.kr|\.gov\.uk|\.gov|\.go\.jp|\.lg\.jp)$/u.test(host)) return 'official';
  if (/(?:^|\.)(?:nkis\.re\.kr|kihasa\.re\.kr|kci\.go\.kr|nypi\.re\.kr)$/u.test(host)) return 'research';
  return 'news';
}

export function seenBriefingStory(candidate: { title: string; url?: string }, history: { title: string; url?: string }[]) {
  const title = (value: string) => normalizeEvidence(value).replace(/\s+-\s+[^-]+$/u, '').toLowerCase();
  return history.some(item => {
    if (candidate.url && item.url && canonicalPublisherUrl(candidate.url) === canonicalPublisherUrl(item.url)) return true;
    return title(candidate.title) === title(item.title)
      || isSameNewsStory({ title: title(candidate.title) }, { title: title(item.title) });
  });
}

function matchingDocument(candidate: BriefingCandidate, title: string, body: string) {
  const tokens = new Set(newsStoryTokens(candidate.title));
  if (!tokens.size) return false;
  const heading = new Set(newsStoryTokens(title + ' ' + body.slice(0, 300)));
  const shared = [...tokens].filter(token => heading.has(token));
  return shared.length >= Math.min(3, tokens.size) && shared.length / tokens.size >= 0.3;
}

export async function readBriefingSource(candidate: BriefingCandidate, runtime: EvidenceRuntime): Promise<ReadSource> {
  if (candidate.feed_kind === 'reviewed_reading') {
    const text = normalizeEvidence(candidate.excerpt);
    if (text.length < 120 || !candidate.reviewed_at) throw new Error('review_excerpt_insufficient');
    if (!youthPolicyScope(candidate.title + ' ' + text)) throw new Error('outside_youth_scope');
    return { ...candidate, evidence_text: text, evidence_scope: 'reviewed_excerpt', retrieved_at: candidate.checked_at };
  }
  let url = candidate.url;
  if (isGoogleNewsUrl(url)) {
    const decoded = await decodeGoogleNewsUrls([url], runtime.fetcher);
    if (!decoded[0] || isGoogleNewsUrl(decoded[0])) throw new Error('publisher_url_unresolved');
    url = decoded[0];
  }
  for (let hop = 0; hop < 4; hop++) {
    url = await checkedUrl(url, runtime);
    const response = await runtime.fetcher(url, {
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'SoilabPolicyBriefing/2.0 (source verification)' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('source_redirect_missing');
      url = new URL(location, url).toString();
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error('source_http_failed'); }
    const contentType = response.headers.get('content-type') || '';
    if (!/(?:text\/html|application\/xhtml\+xml)/iu.test(contentType)) {
      await response.body?.cancel(); throw new Error('unsupported_source_document');
    }
    const document = extractArticleBody(await boundedBody(response));
    if (!matchingDocument(candidate, document.title, document.text)) throw new Error('source_title_mismatch');
    if (!youthPolicyScope(candidate.title + ' ' + document.text)) throw new Error('outside_youth_scope');
    const canonical = canonicalPublisherUrl(url);
    return { ...candidate, url: canonical, tier: sourceTier(canonical), evidence_text: document.text,
      evidence_scope: 'article_body', evidence_truncated: document.truncated, retrieved_at: runtime.now().toISOString() };
  }
  throw new Error('source_redirect_limit');
}

export async function enrichBriefingSources(
  candidates: BriefingCandidate[], runtime: EvidenceRuntime,
  history: { title: string; url?: string }[] = [],
) {
  const sources: ReadSource[] = [];
  const checks: SourceCheck[] = [];
  // Bound external requests; a failed page never becomes a headline-only analysis.
  const pool = candidates.filter(item => !seenBriefingStory(item, history)).slice(0, 6);
  for (let start = 0; start < pool.length; start += 3) {
    const batch = pool.slice(start, start + 3);
    const results = await Promise.allSettled(batch.map(item => readBriefingSource(item, runtime)));
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const item = batch[i];
      if (result.status === 'fulfilled') {
        if (seenBriefingStory(result.value, [...history, ...sources])) {
          checks.push({ title: item.title, url: item.url, status: 'excluded', reason: 'duplicate_story' });
        } else {
          sources.push(result.value);
          checks.push({ title: item.title, url: result.value.url, status: 'read', reason: result.value.evidence_scope });
        }
      } else {
        const code = result.reason instanceof Error ? result.reason.message : '';
        checks.push({ title: item.title, url: item.url, status: 'excluded', reason: /^[a-z_]+$/u.test(code) ? code : 'source_read_failed' });
      }
    }
  }
  const rank = { official: 3, research: 2, news: 1 };
  sources.sort((a, b) => rank[b.tier] - rank[a.tier]);
  return { sources: sources.slice(0, 2), checks };
}

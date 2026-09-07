// Adapted to youth scope from soilab-care-schema's NKIS and law integrations.
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { publicUrl, validDate } from './core.ts';
import { sourceRecord, sourceScope, type Provider, type SourceRecord } from './source-core.ts';

type Row = Record<string, unknown>;
const object = (value: unknown): Row => value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
const array = (value: unknown): unknown[] => value === undefined || value === null || value === '' ? [] : Array.isArray(value) ? value : [value];
export function cleanSourceText(value: unknown): string {
  if (typeof value === 'object') return Object.entries(object(value)).filter(([key]) => !key.startsWith('@_')).map(([, v]) => cleanSourceText(v)).join(' ').trim();
  return String(value ?? '').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
const string = (row: Row, ...keys: string[]) => cleanSourceText(keys.map(k => row[k]).find(v => v !== undefined && v !== null && v !== ''));
const year = (value: string): number | null => /^(19|20)\d{2}$/.test(value) ? Number(value) : null;
function date(value: string) {
  const normalized = /^\d{8}$/.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}` : value;
  return validDate(normalized) ? normalized : null;
}
export function decodeNkisBody(bytes: ArrayBuffer, contentType: string | null) {
  // The list endpoint returns EUC-KR; Response.text() would corrupt Korean titles.
  return new TextDecoder(/euc-?kr|ks_c_5601|cp949/i.test(contentType || '') ? 'euc-kr' : 'utf-8').decode(bytes);
}
function nkisRoot(xml: string): Row {
  const declarations = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  // NKIS detail XML includes an HTML 4 DOCTYPE. Entity declarations remain disabled.
  if (/<!ENTITY/i.test(declarations) || XMLValidator.validate(xml) !== true) throw new Error('nkis_invalid_xml');
  const parsed = object(new XMLParser({ ignoreAttributes: false, parseTagValue: false, trimValues: true, processEntities: false }).parse(xml));
  if (parsed.html || parsed.HTML) throw new Error('nkis_html_response');
  const root = object(parsed.root ?? parsed.ROOT ?? parsed.response ?? parsed.RESPONSE);
  const code = string(root, 'RESULT_CODE', 'resultCode', 'ERROR_CODE', 'errorCode');
  if ((code && !['0', '00', 'SUCCESS'].includes(code.toUpperCase())) || root.ERROR || root.error) throw new Error('nkis_api_error');
  return root;
}
export type NkisItem = { externalId: string; otpId: string; otpSeq: string; type: 'report' | 'policy'; title: string; publisher: string; authors: string; year: number | null; excerpt: string; url: string };
function nkisItem(value: unknown, type: NkisItem['type']): NkisItem | null {
  const row = object(value);
  const otpId = string(row, 'OTP_ID', 'otpId');
  const otpSeq = string(row, 'OTP_SEQ', 'otpSeq') || '0';
  const title = string(row, 'OTP_HAN_NM', 'otpHanNm');
  if (!otpId || !title) return null;
  // Use the stable NKIS catalogue URL. API keys and arbitrary source URLs never enter the archive.
  const url = new URL('https://www.nkis.re.kr/subject_view1.do');
  url.searchParams.set('otpId', otpId); url.searchParams.set('otpSeq', otpSeq);
  return { externalId: `${type}:${otpId}:${otpSeq}`, otpId, otpSeq, type, title,
    publisher: string(row, 'PUBAGC', 'AGC_NM', 'pubagc') || '국가정책연구포털', authors: string(row, 'INCHARGE_NM', 'inchargeNm'),
    year: year(string(row, 'PBL_YY', 'pblYy')), excerpt: string(row, 'HAN_ABS', 'hanAbs').slice(0, 16000), url: url.toString() };
}
export function parseNkisList(xml: string, type: NkisItem['type']) {
  const root = nkisRoot(xml);
  if (!('TOTAL_COUNT' in root || 'totalCount' in root)) throw new Error('nkis_unknown_response');
  const total = Number(string(root, 'TOTAL_COUNT', 'totalCount'));
  if (!Number.isSafeInteger(total) || total < 0) throw new Error('nkis_invalid_count');
  const results = object(root.results ?? root.RESULTS);
  const records = array(results.result ?? results.RESULT).map(v => nkisItem(v, type)).filter((v): v is NkisItem => Boolean(v));
  if (total > 0 && !records.length) throw new Error('nkis_missing_records');
  return { total, records };
}
export function parseNkisDetail(xml: string, item: NkisItem): NkisItem {
  const root = nkisRoot(xml);
  const detail = nkisItem(root.result ?? root.RESULT, item.type);
  if (!detail || detail.externalId !== item.externalId) throw new Error('nkis_detail_mismatch');
  return { ...item, excerpt: detail.excerpt || item.excerpt, authors: detail.authors || item.authors };
}
export function parseLawList(value: unknown) {
  const root = object(object(value).LawSearch);
  if (!('totalCnt' in root) || (root.resultCode && !['00', '0'].includes(String(root.resultCode)))) throw new Error('law_invalid_response');
  const total = Number(root.totalCnt);
  if (!Number.isSafeInteger(total) || total < 0) throw new Error('law_invalid_count');
  const records = array(root.law).map(v => {
    const row = object(v);
    const title = string(row, '법령명한글');
    const external_id = string(row, '법령일련번호');
    if (!title || !external_id) throw new Error('law_missing_record');
    const scope = sourceScope(title);
    if (!scope) return null;
    const published_at = date(string(row, '공포일자'));
    const effective_at = date(string(row, '시행일자'));
    const url = new URL('https://www.law.go.kr/LSW/lsInfoP.do');
    url.searchParams.set('lsiSeq', external_id); url.searchParams.set('efYd', string(row, '시행일자')); url.searchParams.set('urlMode', 'lsInfoP');
    return sourceRecord({ provider: 'law', external_id, title, publisher: string(row, '소관부처명') || '국가법령정보센터',
      url: url.toString(), publication_year: published_at ? Number(published_at.slice(0, 4)) : null, published_at, effective_at,
      scope, raw_excerpt: [string(row, '법령구분명'), string(row, '제개정구분명'), `공포일 ${published_at || '미확인'}`, `시행일 ${effective_at || '미확인'}`].filter(Boolean).join(' · '), authors: '', keywords: [] });
  }).filter((v): v is SourceRecord => Boolean(v));
  if (total > 0 && !array(root.law).length) throw new Error('law_missing_records');
  return { total, records };
}

export type Collection = { provider: Provider; records: SourceRecord[]; requests: number; failures: string[]; truncated: string[]; detailFailures: number };
export async function collectSources(provider: Provider, options: { keywords?: string[]; maxPages?: number; fetcher?: typeof fetch } = {}): Promise<Collection> {
  const key = process.env[provider === 'nkis' ? 'NKIS_API_KEY' : 'LAW_GO_KR_OC'];
  if (!key) throw new Error(`${provider}_not_configured`);
  const keywords = options.keywords || (provider === 'nkis' ? ['고립', '은둔', '가족돌봄'] : ['위기아동']);
  const maxPages = Math.min(5, Math.max(1, options.maxPages || 2));
  const fetcher = options.fetcher || fetch;
  const result: Collection = { provider, records: [], requests: 0, failures: [], truncated: [], detailFailures: 0 };
  const records = new Map<string, SourceRecord>();
  const tasks = keywords.flatMap(keyword => (provider === 'nkis' ? ['report', 'policy'] : ['law']).map(type => ({ keyword, type })));
  // At most six lists in parallel; every request has a timeout and bounded pages.
  const outcomes = await Promise.allSettled(tasks.map(async ({ keyword, type }) => {
    const found: (NkisItem | SourceRecord)[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const url = new URL(provider === 'nkis' ? `https://nkis.re.kr/nkisApi/search/${type === 'report' ? 'Report' : 'Research'}List.do` : 'https://www.law.go.kr/DRF/lawSearch.do');
      const params = provider === 'nkis' ? { serviceKey: key, otpHanNm: keyword, pageNo: String(page), rowCnt: '50' } : { OC: key, target: 'law', type: 'JSON', search: '1', query: keyword, display: '50', page: String(page) };
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, v); });
      const referer = process.env.LAW_GO_KR_REFERER;
      if (provider === 'law' && !referer) throw new Error('law_referer_not_configured');
      result.requests++;
      const response = await fetcher(url, { headers: provider === 'law' ? { Accept: 'application/json', Origin: new URL(referer!).origin, Referer: referer! } : { Accept: 'application/xml' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('upstream_http');
      const parsed = provider === 'nkis' ? parseNkisList(decodeNkisBody(await response.arrayBuffer(), response.headers.get('content-type')), type as NkisItem['type']) : parseLawList(await response.json());
      found.push(...parsed.records);
      if (page * 50 >= parsed.total) break;
      if (page === maxPages) result.truncated.push(`${keyword}/${type}`);
    }
    return found.map(item => ({ item, keyword }));
  }));
  const nkis = new Map<string, { item: NkisItem; keywords: string[] }>();
  outcomes.forEach((outcome, i) => {
    if (outcome.status === 'rejected') { result.failures.push(`${tasks[i].keyword}/${tasks[i].type}`); return; }
    for (const { item, keyword } of outcome.value) {
      if ('otpId' in item) {
        if (!sourceScope(item.title)) continue;
        const prior = nkis.get(item.externalId);
        nkis.set(item.externalId, { item, keywords: [...new Set([...(prior?.keywords || []), keyword])] });
      } else {
        const prior = records.get(item.id);
        records.set(item.id, { ...item, keywords: [...new Set([...(prior?.keywords || []), keyword])] });
      }
    }
  });
  if (result.failures.length === tasks.length) throw new Error(`${provider}_all_requests_failed`);
  // Details are required for NKIS persistence. A transient detail failure must not erase a saved abstract.
  const targets = [...nkis.values()].sort((a, b) => (b.item.year || 0) - (a.item.year || 0));
  if (targets.length > 24) result.truncated.push('상세 조회 상한 24건');
  const details = await Promise.allSettled(targets.slice(0, 24).map(async ({ item, keywords }) => {
    const url = new URL(`https://nkis.re.kr/nkisApi/search/${item.type === 'report' ? 'Report' : 'Research'}Detail.do`);
    url.searchParams.set('serviceKey', key); url.searchParams.set('otpId', item.otpId); url.searchParams.set('otpSeq', item.otpSeq);
    result.requests++;
    const response = await fetcher(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('detail_http');
    const detail = parseNkisDetail(decodeNkisBody(await response.arrayBuffer(), response.headers.get('content-type')), item);
    const scope = sourceScope(detail.title);
    if (!scope || !publicUrl(detail.url)) throw new Error('invalid_source');
    return sourceRecord({ provider: 'nkis', external_id: detail.externalId, title: detail.title, publisher: detail.publisher, url: detail.url, publication_year: detail.year,
      published_at: null, effective_at: null, scope, raw_excerpt: detail.excerpt, authors: detail.authors, keywords });
  }));
  details.forEach(detail => { if (detail.status === 'fulfilled') records.set(detail.value.id, detail.value); else result.detailFailures++; });
  if (targets.length && details.every(d => d.status === 'rejected')) throw new Error('nkis_all_details_failed');
  result.records = [...records.values()].sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0));
  return result;
}

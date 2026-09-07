import { createHash } from 'node:crypto';
import type { Evidence } from '../../data/research.ts';

export type Provider = 'nkis' | 'law';
export type SourceRecord = {
  id: string; provider: Provider; external_id: string; title: string; publisher: string;
  url: string; publication_year: number | null; published_at: string | null; effective_at: string | null;
  scope: 'youth' | 'all_ages'; raw_excerpt: string; authors: string; keywords: string[];
  content_hash: string; checked_at: string;
};
export type ReviewedSource = SourceRecord & {
  review_status: 'pending' | 'approved' | 'excluded';
  summary: string; application: string; limitation: string; review_scope: string; topics: string[];
  imported_at: string; reviewed_at: string | null;
};

export function sourceScope(title: string): SourceRecord['scope'] | null {
  const text = title.replace(/\s/g, '');
  if (/위기아동.*청년|가족돌봄.*청(?:소)?년/.test(text)) return 'youth';
  if (!/고립|은둔|외로움/.test(text)) return null;
  if (/청년|청소년|아동/.test(text)) return 'youth';
  if (/생애주기|사회적고립.*(?:예방|대응|법제)|고립.*외로움/.test(text)) return 'all_ages';
  return null;
}

export function sourceRecord(input: Omit<SourceRecord, 'id' | 'content_hash' | 'checked_at'>, now = new Date()): SourceRecord {
  const id = `${input.provider}-${createHash('sha256').update(input.external_id).digest('hex').slice(0, 24)}`;
  // Search keywords and collection time do not change the evidence revision.
  const content = { ...input, keywords: undefined };
  return { ...input, id, content_hash: createHash('sha256').update(JSON.stringify(content)).digest('hex'), checked_at: now.toISOString() };
}

export function sourceEvidence(row: ReviewedSource): Evidence {
  return { id: row.id, title: row.title, publisher: row.publisher, country: '한국', kind: row.provider === 'law' ? '법령' : '연구',
    year: row.publication_year ? String(row.publication_year) : '연도 확인 필요', url: row.url,
    summary: row.summary, application: row.application, limitation: row.limitation,
    reviewScope: row.review_scope, reviewedAt: row.reviewed_at?.slice(0, 10), topics: row.topics,
    scope: row.scope, publishedAt: row.published_at, effectiveAt: row.effective_at,
  };
}

export function parseSourceReview(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('invalid_review');
  const data = input as Record<string, unknown>;
  if (typeof data.id !== 'string' || !/^(nkis|law)-[a-f0-9]{24}$/.test(data.id)
    || typeof data.content_hash !== 'string' || !/^[a-f0-9]{64}$/.test(data.content_hash)
    || !['pending', 'approved', 'excluded'].includes(String(data.review_status))) throw new Error('invalid_review');
  const fields: Record<'summary' | 'application' | 'limitation' | 'review_scope', string> = { summary: '', application: '', limitation: '', review_scope: '' };
  for (const key of Object.keys(fields) as (keyof typeof fields)[]) {
    if (typeof data[key] !== 'string' || data[key].length > (key === 'review_scope' ? 500 : 2500)) throw new Error('invalid_review');
    fields[key] = data[key].trim();
    if (data.review_status === 'approved' && !fields[key]) throw new Error('review_fields_required');
  }
  const allowed = ['outreach', 'recovery', 'family', 'work', 'evaluation', 'policy'];
  if (!Array.isArray(data.topics) || !data.topics.every(t => typeof t === 'string' && allowed.includes(t))) throw new Error('invalid_topics');
  const topics = [...new Set(data.topics as string[])];
  if (data.review_status === 'approved' && !topics.length) throw new Error('review_topics_required');
  return { id: data.id, content_hash: data.content_hash, review_status: data.review_status as ReviewedSource['review_status'], ...fields, topics };
}

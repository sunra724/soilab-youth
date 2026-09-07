import { timingSafeEqual } from 'node:crypto';

export const deliveryStatuses = ['pending', 'sending', 'delivered', 'failed', 'uncertain'] as const;
export type DeliveryStatus = typeof deliveryStatuses[number];
export type SourceSnapshot = { title: string; url: string; publisher: string; tier: 'official' | 'research' | 'news'; checked_at: string };
export type BriefingInput = {
  briefing_date: string;
  title: string;
  summary: string;
  body_text: string;
  sources: SourceSnapshot[];
  generator_model: string | null;
};
export type Briefing = BriefingInput & {
  delivery_status: DeliveryStatus;
  message_id: number | null;
  published_at: string;
};

export function authorized(authorization: string | null, expected?: string, minimumLength = 32) {
  if (!expected || expected.length < minimumLength || !authorization?.startsWith('Bearer ')) return false;
  const left = Buffer.from(authorization.slice(7));
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function briefingIngestToken(env: Record<string, string | undefined> = process.env) {
  return env.BRIEFING_INGEST_TOKEN?.trim() || env.YOUTH_BRIEFING_INGEST_TOKEN?.trim() || undefined;
}

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function publicUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 1600) return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (!url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(url.hostname)) return null;
    return url.toString();
  } catch { return null; }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_object');
  return value as Record<string, unknown>;
}

function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error('invalid_text');
  return value.trim();
}

export function parseBriefing(value: unknown): BriefingInput {
  const body = record(value);
  if (!validDate(body.briefing_date)) throw new Error('invalid_date');
  if (!Array.isArray(body.sources) || body.sources.length > 15) throw new Error('invalid_sources');
  const sources = body.sources.map(item => {
    const source = record(item);
    const url = publicUrl(source.url);
    if (!url || !['official', 'research', 'news'].includes(String(source.tier))) throw new Error('invalid_source');
    const checkedAt = text(source.checked_at, 40);
    if (!Number.isFinite(Date.parse(checkedAt))) throw new Error('invalid_checked_at');
    return { title: text(source.title, 250), url, publisher: text(source.publisher, 150), tier: source.tier as SourceSnapshot['tier'], checked_at: checkedAt };
  });
  return { briefing_date: body.briefing_date, title: text(body.title, 160), summary: text(body.summary, 600), body_text: text(body.body_text, 3500), sources,
    generator_model: body.generator_model ? text(body.generator_model, 100) : null };
}

export function parseDelivery(value: unknown) {
  const body = record(value);
  if (!validDate(body.briefing_date)) throw new Error('invalid_date');
  if (!['claim', 'delivered', 'failed', 'uncertain'].includes(String(body.action))) throw new Error('invalid_action');
  if (body.action === 'delivered' && (!Number.isSafeInteger(body.message_id) || Number(body.message_id) <= 0)) throw new Error('invalid_message_id');
  return { briefing_date: body.briefing_date, action: body.action as 'claim' | 'delivered' | 'failed' | 'uncertain', message_id: body.action === 'delivered' ? Number(body.message_id) : null };
}

export function telegramChannelUrl(value = process.env.YOUTH_BRIEFING_CHANNEL_URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 't.me' && /^\/[A-Za-z0-9_]{5,}$/.test(url.pathname) && !url.username && !url.password && !url.search && !url.hash ? url.toString() : null;
  } catch { return null; }
}

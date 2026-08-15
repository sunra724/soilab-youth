interface DecodeParams {
  id: string;
  signature: string;
  timestamp: number;
}

const GOOGLE_NEWS_HOST = 'news.google.com';
const GOOGLE_NEWS_RPC = 'Fbv4je';
const TRACKING_QUERY_PARAMS = new Set([
  'fbclid',
  'gclid',
  'outurl',
]);

export function canonicalPublisherUrl(value: string) {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) {
      const normalized = key.toLocaleLowerCase('en-US');
      if (
        normalized.startsWith('utm_')
        || TRACKING_QUERY_PARAMS.has(normalized)
      ) {
        url.searchParams.delete(key);
      }
    }
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function isGoogleNewsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === GOOGLE_NEWS_HOST
      && /\/(?:rss\/)?articles\//u.test(url.pathname);
  } catch {
    return false;
  }
}

function articleId(value: string) {
  try {
    const url = new URL(value);
    return url.pathname.split('/').filter(Boolean).at(-1) ?? '';
  } catch {
    return '';
  }
}

function parseDecodeParams(html: string, fallbackId: string): DecodeParams | null {
  const id = html.match(/data-n-a-id="([^"]+)"/u)?.[1] ?? fallbackId;
  const signature = html.match(/data-n-a-sg="([^"]+)"/u)?.[1] ?? '';
  const timestamp = Number(html.match(/data-n-a-ts="([^"]+)"/u)?.[1] ?? 0);

  if (!id || !signature || !Number.isSafeInteger(timestamp) || timestamp <= 0) {
    return null;
  }

  return { id, signature, timestamp };
}

function rpcEntry(params: DecodeParams) {
  const context = [
    ['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1],
    'X',
    'X',
    1,
    [1, 1, 1],
    1,
    1,
    null,
    0,
    0,
    null,
    0,
  ];
  const args = ['garturlreq', context, params.id, params.timestamp, params.signature];
  return [GOOGLE_NEWS_RPC, JSON.stringify(args), null, 'generic'];
}

export function parseGoogleNewsBatchResponse(payload: string) {
  const jsonText = payload.replace(/^\)\]\}'\s*/u, '').trim();
  const records = JSON.parse(jsonText) as unknown[];
  const decoded: string[] = [];

  for (const record of records) {
    if (!Array.isArray(record) || record[0] !== 'wrb.fr' || record[1] !== GOOGLE_NEWS_RPC) {
      continue;
    }
    if (typeof record[2] !== 'string') {
      decoded.push('');
      continue;
    }

    try {
      const result = JSON.parse(record[2]) as unknown[];
      decoded.push(typeof result[1] === 'string' ? result[1] : '');
    } catch {
      decoded.push('');
    }
  }

  return decoded;
}

async function fetchDecodeParams(url: string): Promise<DecodeParams | null> {
  const id = articleId(url);
  if (!id) return null;

  const response = await fetch(`https://${GOOGLE_NEWS_HOST}/rss/articles/${id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoilabNewsClipping/1.0)' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  return parseDecodeParams(await response.text(), id);
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  mapper: (value: T) => Promise<R>,
) {
  const result = new Array<R>(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      result[index] = await mapper(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker()),
  );
  return result;
}

export async function decodeGoogleNewsUrls(urls: string[]) {
  const params = await mapWithConcurrency(urls, 5, fetchDecodeParams);
  const valid = params
    .map((value, index) => ({ value, index }))
    .filter((entry): entry is { value: DecodeParams; index: number } => Boolean(entry.value));
  const output = new Array<string>(urls.length).fill('');

  if (valid.length === 0) {
    return output;
  }

  const decoded = await mapWithConcurrency(valid, 5, async (entry) => {
    const body = new URLSearchParams({
      'f.req': JSON.stringify([[rpcEntry(entry.value)]]),
    });
    const response = await fetch(
      `https://${GOOGLE_NEWS_HOST}/_/DotsSplashUi/data/batchexecute?rpcids=${GOOGLE_NEWS_RPC}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (compatible; SoilabNewsClipping/1.0)',
        },
        body,
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok) return '';
    return parseGoogleNewsBatchResponse(await response.text())[0] ?? '';
  });

  valid.forEach((entry, index) => {
    output[entry.index] = canonicalPublisherUrl(decoded[index]);
  });
  return output;
}

export function stripGoogleNewsPublisher(title: string, source: string) {
  const suffix = source ? ` - ${source}` : '';
  let cleanTitle = title.trim();
  while (suffix && cleanTitle.endsWith(suffix)) {
    cleanTitle = cleanTitle.slice(0, -suffix.length).trim();
  }
  return cleanTitle;
}

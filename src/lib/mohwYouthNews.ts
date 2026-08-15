export const MOHW_PRESS_RSS_URL = 'https://www.mohw.go.kr/rss/board.es?mid=a10503000000&bid=0027&info';
export const MOHW_NEWS_SOURCE = '보건복지부';

export interface MohwYouthNews {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : null;
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return '';
}

function cleanFeedText(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/gu, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/giu, ' ')
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])>/giu, '\n')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&#x([0-9a-f]+);/giu, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/gu, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;|&#160;/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/\r/gu, '')
    .replace(/[ \t]+/gu, ' ')
    .replace(/ *\n */gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

export function canonicalizeMohwNewsUrl(value: string) {
  try {
    const parsed = new URL(value.replaceAll('&amp;', '&'));
    if (!/(^|\.)mohw\.go\.kr$/iu.test(parsed.hostname) || parsed.pathname !== '/board.es') {
      return '';
    }

    const listNo = parsed.searchParams.get('list_no');
    if (!listNo) {
      return '';
    }

    const params = new URLSearchParams({
      mid: parsed.searchParams.get('mid') ?? 'a10503000000',
      bid: parsed.searchParams.get('bid') ?? '0027',
      list_no: listNo,
      act: 'view',
    });

    return `https://www.mohw.go.kr/board.es?${params.toString()}`;
  } catch {
    return '';
  }
}

export function mohwNewsTitleKey(value: string) {
  return cleanFeedText(value)
    .normalize('NFKC')
    .replace(/\s*[-–—|]\s*(?:보건복지부|대한민국\s*정책브리핑|정책브리핑)\s*$/u, '')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('ko-KR');
}

export function isMohwYouthNews(title: string, description = '') {
  const text = cleanFeedText(`${title} ${description}`).normalize('NFKC');
  const directPatterns = [
    /청년\s*미래\s*센터/u,
    /가족\s*돌봄\s*청(?:소)?년/u,
    /고립[\s·ㆍ・‧,\/\-]*(?:및|과|와)?[\s·ㆍ・‧,\/\-]*은둔\s*청년/u,
    /위기\s*아동[\s·ㆍ・‧,\/\-]*(?:및|과|와)?[\s·ㆍ・‧,\/\-]*청년/u,
  ];

  if (directPatterns.some((pattern) => pattern.test(text))) {
    return true;
  }

  const mentionsYouth = /청(?:소)?년/u.test(text);
  const mentionsTarget = /(고립|은둔|가족\s*돌봄)/u.test(text);
  const mentionsSupport = /(지원|자립|회복|발굴|상담|서비스|정책|사업|센터|프로그램)/u.test(text);
  return mentionsYouth && mentionsTarget && mentionsSupport;
}

export function normalizeMohwYouthNewsItem(value: unknown): MohwYouthNews | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const title = cleanFeedText(firstString(record, ['title']));
  const description = cleanFeedText(firstString(record, [
    'contentSnippet',
    'content',
    'description',
    'content:encoded',
  ]));
  const url = canonicalizeMohwNewsUrl(firstString(record, ['link', 'guid']));
  const publishedAt = firstString(record, ['pubDate', 'isoDate']) || new Date().toISOString();

  if (!title || !url || !isMohwYouthNews(title, description)) {
    return null;
  }

  return {
    title,
    url,
    description,
    publishedAt,
  };
}

export function selectMohwYouthNews(items: readonly unknown[]) {
  return items
    .map(normalizeMohwYouthNewsItem)
    .filter((item): item is MohwYouthNews => item !== null);
}

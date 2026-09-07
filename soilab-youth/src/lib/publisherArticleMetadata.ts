export interface PublisherArticleMetadata {
  publishedTime: string;
  sections: string[];
}

function attribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'iu'),
  );
  return match?.[1]?.trim() ?? '';
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function extractPublisherArticleMetadata(
  html: string,
): PublisherArticleMetadata {
  const sections: string[] = [];
  const publishedTimes: string[] = [];
  const metaTags = html.match(/<meta\s+[^>]*>/giu) ?? [];

  for (const tag of metaTags) {
    const key = (
      attribute(tag, 'property')
      || attribute(tag, 'name')
      || attribute(tag, 'itemprop')
    ).toLocaleLowerCase('en-US');
    const content = attribute(tag, 'content');
    if (!content) continue;

    if (key === 'article:section') {
      sections.push(content);
    }
    if (
      key === 'article:published_time'
      || key === 'datepublished'
      || key === 'pubdate'
    ) {
      publishedTimes.push(content);
    }
  }

  for (const match of html.matchAll(
    /["']articleSection["']\s*:\s*["']([^"']+)["']/giu,
  )) {
    sections.push(match[1]);
  }
  for (const match of html.matchAll(
    /["']datePublished["']\s*:\s*["']([^"']+)["']/giu,
  )) {
    publishedTimes.push(match[1]);
  }

  return {
    publishedTime: unique(publishedTimes)[0] ?? '',
    sections: unique(sections),
  };
}

const EXCLUDED_SECTION_MARKERS = [
  '문화',
  '책',
  '출판',
  '문학',
  '영화',
  '공연',
  '연예',
  '스포츠',
  'culture',
  'book',
  'movie',
  'entertainment',
  'sports',
] as const;

export function isExcludedPublisherSection(sections: string[]) {
  return sections.some((section) => {
    const normalized = section
      .normalize('NFKC')
      .trim()
      .toLocaleLowerCase('ko-KR');
    return EXCLUDED_SECTION_MARKERS.some((marker) =>
      normalized.includes(marker.toLocaleLowerCase('ko-KR'))
    );
  });
}

export async function fetchPublisherArticleMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SoilabNewsClipping/1.0)',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { publishedTime: '', sections: [] };
    }
    const html = (await response.text()).slice(0, 2_000_000);
    return extractPublisherArticleMetadata(html);
  } catch {
    return { publishedTime: '', sections: [] };
  }
}

export interface NewsStoryReference {
  title: string;
  publishedAt?: string;
}

const GENERIC_TOKENS = new Set([
  '고립',
  '은둔',
  '청년',
  '지원',
  '사업',
  '관련',
  '대한',
  '위한',
  '통해',
  '추진',
  '운영',
  '확대',
  '상담',
  '모집',
  '나선다',
]);

function normalizeAlias(value: string) {
  return value
    .replace(/심야\s*노동\s*(?:청년|자)/gu, '심야노동')
    .replace(/마음\s*건강/gu, '마음건강')
    .replace(/은둔형\s*외톨이/gu, '은둔형외톨이')
    .replace(/상담\s*받(?:는|는다|았다|기)/gu, '상담')
    .replace(/가족/gu, '부모')
    .replace(/서울시/gu, '서울');
}

export function newsStoryTokens(title: string) {
  return normalizeAlias(title.normalize('NFKC').toLocaleLowerCase('ko-KR'))
    .replace(/\[[^\]]+\]/gu, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/u)
    .map((token) => token
      .replace(/(?:한다|했다|된다|됐다|이다)$/u, '')
      .replace(/(?:과의|와의|에게|에서|으로|은|는|이|가|을|를)$/u, ''),
    )
    .filter((token) => token.length >= 2 && !GENERIC_TOKENS.has(token));
}

function dateDistanceInDays(left?: string, right?: string) {
  if (!left || !right) return 0;

  const leftTime = new Date(`${left.slice(0, 10)}T00:00:00Z`).getTime();
  const rightTime = new Date(`${right.slice(0, 10)}T00:00:00Z`).getTime();
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.abs(leftTime - rightTime) / 86_400_000;
}

export function newsTitleSimilarity(left: string, right: string) {
  const leftTokens = new Set(newsStoryTokens(left));
  const rightTokens = new Set(newsStoryTokens(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }

  return intersection / (leftTokens.size + rightTokens.size - intersection);
}

function newsTitleContainment(left: string, right: string) {
  const leftTokens = new Set(newsStoryTokens(left));
  const rightTokens = new Set(newsStoryTokens(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }
  return intersection / Math.min(leftTokens.size, rightTokens.size);
}

export function isSameNewsStory(
  left: NewsStoryReference,
  right: NewsStoryReference,
) {
  if (dateDistanceInDays(left.publishedAt, right.publishedAt) > 3) {
    return false;
  }

  const leftTokens = new Set(newsStoryTokens(left.title));
  const rightTokens = new Set(newsStoryTokens(right.title));
  const sharedTokens = [...leftTokens].filter((token) => rightTokens.has(token));

  return sharedTokens.length >= 3
    && (
      newsTitleSimilarity(left.title, right.title) >= 0.55
      || newsTitleContainment(left.title, right.title) >= 0.5
    );
}

export function collapseRelatedNews<T extends NewsStoryReference>(items: T[]) {
  const distinct: T[] = [];

  for (const item of items) {
    if (distinct.some((saved) => isSameNewsStory(item, saved))) {
      continue;
    }
    distinct.push(item);
  }

  return distinct;
}

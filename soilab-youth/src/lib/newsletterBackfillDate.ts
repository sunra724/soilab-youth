const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

export const MAX_NEWSLETTER_BACKFILL_DAYS = 31;

function dateParts(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error('날짜는 YYYY-MM-DD 형식이어야 합니다.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error(`유효하지 않은 날짜입니다: ${value}`);
  }

  return { year, month, day };
}

export function addIsoDays(value: string, amount: number) {
  const { year, month, day } = dateParts(value);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

export function kstDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return year && month && day ? `${year}-${month}-${day}` : '';
}

export function enumerateHistoricalDates(
  from: string,
  to: string,
  today = kstDateKey(new Date()),
) {
  dateParts(from);
  dateParts(to);
  dateParts(today);

  if (from > to) {
    throw new Error('from은 to보다 늦을 수 없습니다.');
  }
  if (to >= today) {
    throw new Error('백필 범위는 오늘보다 이전 날짜만 지정할 수 있습니다.');
  }

  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    if (dates.length > MAX_NEWSLETTER_BACKFILL_DAYS) {
      throw new Error(
        `한 번에 최대 ${MAX_NEWSLETTER_BACKFILL_DAYS}일까지만 생성할 수 있습니다.`,
      );
    }
    cursor = addIsoDays(cursor, 1);
  }

  return dates;
}

export function historicalGoogleNewsRssUrl(query: string, date: string) {
  const nextDate = addIsoDays(date, 1);
  const datedQuery = `${query} after:${date} before:${nextDate}`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(datedQuery)}&hl=ko&gl=KR&ceid=KR:ko`;
}

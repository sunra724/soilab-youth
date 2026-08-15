const YOUTH_CENTER_ORIGIN = 'https://www.youthcenter.go.kr';
const YOUTH_CENTER_SEARCH_URL = `${YOUTH_CENTER_ORIGIN}/pubot/search/portalPolicySearch`;
const YOUTH_FOUNDATION_ORIGIN = 'https://kyf.or.kr';
const YOUTH_FOUNDATION_BOARD_ID = 'BBSMSTR_000000000367';
const YOUTH_FOUNDATION_BOARD_URL = `${YOUTH_FOUNDATION_ORIGIN}/user/board.do`;

const ISOLATION_PATTERN = /(고립|은둔|은둔형\s*외톨이)/u;
const RECRUITMENT_PATTERN = /(모집|참여자|참여청년|신청)/u;
const NON_PARTICIPANT_PATTERN = /(채용|용역|입찰|합격자|선정\s*결과|일경험처|지원조직|종사자)/u;

export interface SupportProgram {
  id: string;
  title: string;
  url: string;
  source: string;
  description: string;
  publishedAt: string;
  applicationPeriod: string;
  applicationEndDate: string | null;
}

interface CollectSupportProgramOptions {
  limitPerSource?: number;
  lookbackDays?: number;
  now?: Date;
}

interface YouthFoundationBoardItem {
  id: string;
  title: string;
  publishedAt: string;
  url: string;
  applicationEndDate: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : null;
}

function stringValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/giu, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/gu, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;|&#160;/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'");
}

export function cleanHtmlText(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<!--[\s\S]*?-->/gu, ' ')
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/giu, ' ')
      .replace(/<br\s*\/?>/giu, '\n')
      .replace(/<\/(?:p|div|li|h[1-6])>/giu, '\n')
      .replace(/<[^>]+>/gu, ' ')
  )
    .replace(/\r/gu, '')
    .replace(/[ \t]+/gu, ' ')
    .replace(/ *\n */gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

function compactText(value: string) {
  return cleanHtmlText(value)
    .replace(/\s+/gu, ' ')
    .replace(/\s*·\s*/gu, '·')
    .trim();
}

function truncateText(value: string, maxLength: number) {
  const text = compactText(value);
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function kstDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

function validDateKey(year: number, month: number, day: number) {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function compactDateKey(value: string) {
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})$/u);
  if (!match) {
    return null;
  }

  return validDateKey(Number(match[1]), Number(match[2]), Number(match[3]));
}

function dottedDateKey(value: string) {
  const match = value.trim().match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/u);
  if (!match) {
    return null;
  }

  return validDateKey(Number(match[1]), Number(match[2]), Number(match[3]));
}

function formatDateKey(value: string) {
  return value.replaceAll('-', '.');
}

function isExpired(endDate: string | null, now: Date) {
  return Boolean(endDate && endDate < kstDateKey(now));
}

function applicationPeriod(status: string, startDate: string | null, endDate: string | null) {
  if (status.includes('상시') || (!startDate && !endDate)) {
    return '신청기간: 상시';
  }

  if (startDate && endDate) {
    return `신청기간: ${formatDateKey(startDate)} ~ ${formatDateKey(endDate)}`;
  }

  return endDate ? `신청마감: ${formatDateKey(endDate)}` : '';
}

function updatedDate(record: Record<string, unknown>) {
  return dottedDateKey(stringValue(record, 'LAST_MDFCN_DT'))
    ?? dottedDateKey(stringValue(record, 'FRST_REG_DT'))
    ?? '';
}

function youthCenterSearchPayload(query: string, listCount: number) {
  return {
    PVSN_INST_GROUP_CD: '',
    SPRT_TRGT_AGE: '',
    EARN_MIN_AMT: '',
    EARN_MAX_AMT: '',
    QLFC_ACBG_NM: '',
    MRG_STTS_CD: '',
    query,
    MJR_CND_NM: '',
    EMPM_STTS_NM: '',
    STDG_NM: '',
    SPCL_FLD_NM: '',
    USER_MCLSF_NO: '',
    STDG_CTPV_NM: '',
    PLCY_KYWD_SN: '',
    pageNum: 1,
    sortFields: '',
    listCount,
    searchFields: 'all',
    APLY_PRD_BGNG_YMD: '',
    APLY_PRD_END_YMD: '',
    APLY_PRD_SE_CD: '',
    ODTM_CD: '',
  };
}

export function parseYouthCenterResponse(payload: unknown, now = new Date()) {
  const root = asRecord(payload);
  const searchResult = root ? asRecord(root.searchResult) : null;
  const rawItems = searchResult?.youthpolicy;
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const programs: SupportProgram[] = [];

  for (const value of rawItems) {
    const item = asRecord(value);
    if (!item) {
      continue;
    }

    const id = compactText(stringValue(item, 'DOCID'));
    const title = compactText(stringValue(item, 'PLCY_NM'));
    const explanation = compactText(stringValue(item, 'PLCY_EXPLN_CN'));
    const support = compactText(stringValue(item, 'PLCY_SPRT_CN'));
    const keywords = compactText(stringValue(item, 'PLCY_KYWD_NM'));
    const status = compactText(stringValue(item, 'APLY_PRD_SE_CD'));
    const startDate = compactDateKey(stringValue(item, 'APLY_PRD_BGNG_YMD'));
    const endDate = compactDateKey(stringValue(item, 'APLY_PRD_END_YMD'));

    if (
      !id
      || !title
      || !ISOLATION_PATTERN.test(`${title} ${explanation} ${support} ${keywords}`)
      || status.includes('마감')
      || isExpired(endDate, now)
    ) {
      continue;
    }

    const institution = compactText(
      stringValue(item, 'OPER_INST_CD_NM')
      || stringValue(item, 'RGTR_UP_INST_CD_NM')
      || stringValue(item, 'SPRVSN_INST_CD_NM')
    );

    programs.push({
      id: `youthcenter:${id}`,
      title,
      url: `${YOUTH_CENTER_ORIGIN}/youthPolicy/ythPlcyTotalSearch/ythPlcyDetail/${encodeURIComponent(id)}`,
      source: institution ? `온통청년 · ${institution}` : '온통청년',
      description: truncateText(explanation || support, 360),
      publishedAt: updatedDate(item),
      applicationPeriod: applicationPeriod(status, startDate, endDate),
      applicationEndDate: endDate,
    });
  }

  return programs;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function sortPrograms(programs: SupportProgram[]) {
  return programs.sort((left, right) => {
    const leftEnd = left.applicationEndDate ?? '9999-12-31';
    const rightEnd = right.applicationEndDate ?? '9999-12-31';
    return leftEnd.localeCompare(rightEnd)
      || right.publishedAt.localeCompare(left.publishedAt)
      || left.title.localeCompare(right.title, 'ko');
  });
}

export async function fetchYouthCenterPrograms(limit = 5, now = new Date()) {
  const listCount = Math.max(12, Math.min(limit * 3, 30));
  const responses = await Promise.all(
    ['고립', '은둔'].map(async (query) => {
      const response = await fetchWithTimeout(YOUTH_CENTER_SEARCH_URL, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=UTF-8',
          Referer: `${YOUTH_CENTER_ORIGIN}/youthPolicy/ythPlcyTotalSearch`,
          'User-Agent': 'soilab-newsletter/1.0 (+https://soilab-youth.kr)',
        },
        body: JSON.stringify(youthCenterSearchPayload(query, listCount)),
      });

      return parseYouthCenterResponse(await response.json(), now);
    })
  );

  const unique = new Map<string, SupportProgram>();
  for (const program of responses.flat()) {
    unique.set(program.id, program);
  }

  return sortPrograms([...unique.values()]).slice(0, limit);
}

function parseFlexibleDateToken(token: string, fallbackYear: number) {
  const parts = token
    .replace(/\s+/gu, '')
    .replace(/년|월/gu, '.')
    .replace(/일/gu, '')
    .split(/[.\-/]/u)
    .filter(Boolean)
    .map(Number);

  if (parts.length === 2) {
    return validDateKey(fallbackYear, parts[0], parts[1]);
  }

  if (parts.length !== 3) {
    return null;
  }

  const year = parts[0] < 100 ? 2000 + parts[0] : parts[0];
  return validDateKey(year, parts[1], parts[2]);
}

export function extractApplicationEndDate(text: string, publishedAt: string) {
  const fallbackYear = Number(publishedAt.slice(0, 4)) || new Date().getFullYear();
  const candidateDates: string[] = [];

  for (const line of cleanHtmlText(text).split('\n')) {
    if (!/(모집|참여\s*신청|신청(?:기간|일정|마감)?|접수(?:기간|마감)?)/u.test(line)) {
      continue;
    }

    const tokens = line.match(
      /(?:(?:20)?\d{2}\s*(?:[.\-/]|년)\s*\d{1,2}\s*(?:[.\-/]|월)\s*\d{1,2}\s*일?|\d{1,2}\s*[.\-/]\s*\d{1,2})/gu
    ) ?? [];
    const parsed = tokens
      .map((token) => parseFlexibleDateToken(token, fallbackYear))
      .filter((date): date is string => Boolean(date));

    if (parsed.length > 0) {
      candidateDates.push(parsed.at(-1)!);
    }
  }

  return candidateDates.sort().at(-1) ?? null;
}

function withinLookback(publishedAt: string, lookbackDays: number, now: Date) {
  const published = new Date(`${publishedAt}T00:00:00+09:00`).getTime();
  if (!Number.isFinite(published)) {
    return false;
  }

  return published >= now.getTime() - lookbackDays * 24 * 60 * 60 * 1000;
}

export function parseYouthFoundationBoard(
  html: string,
  options: { lookbackDays?: number; now?: Date } = {}
) {
  const now = options.now ?? new Date();
  const lookbackDays = options.lookbackDays ?? 90;
  const items: YouthFoundationBoardItem[] = [];
  const itemPattern = /onclick="[^"]*fn_detail\('(\d+)'\);?[^"]*"[\s\S]*?<p\s+class="subject">([\s\S]*?)<\/p>[\s\S]*?<span\s+class="field_name">\s*작성일\s*<\/span>\s*<span\s+class="field_cont">([\s\S]*?)<\/span>/giu;

  for (const match of html.matchAll(itemPattern)) {
    const id = match[1];
    const title = compactText(match[2]);
    const publishedAt = dottedDateKey(compactText(match[3]));
    if (
      !id
      || !title
      || !publishedAt
      || !ISOLATION_PATTERN.test(title)
      || !RECRUITMENT_PATTERN.test(title)
      || NON_PARTICIPANT_PATTERN.test(title)
      || !withinLookback(publishedAt, lookbackDays, now)
    ) {
      continue;
    }

    const applicationEndDate = extractApplicationEndDate(title, publishedAt);
    if (isExpired(applicationEndDate, now)) {
      continue;
    }

    items.push({
      id,
      title,
      publishedAt,
      url: `${YOUTH_FOUNDATION_ORIGIN}/user/boardDetail.do?bbsId=${YOUTH_FOUNDATION_BOARD_ID}&nttNo=${encodeURIComponent(id)}`,
      applicationEndDate,
    });
  }

  return items;
}

export function extractYouthFoundationDetail(html: string) {
  const match = html.match(
    /<div\s+class="cont">([\s\S]*?)<\/div>\s*<\/div>\s*<div\s+class="btngroup/iu
  );
  return match ? cleanHtmlText(match[1]) : '';
}

export async function fetchYouthFoundationPrograms(
  limit = 5,
  lookbackDays = 90,
  now = new Date()
) {
  const body = new URLSearchParams({
    pageIndex: '1',
    bbsId: YOUTH_FOUNDATION_BOARD_ID,
    searchCnd: 'all',
    searchEtcCd1: '',
    searchWrd: '고립',
  });
  const boardResponse = await fetchWithTimeout(YOUTH_FOUNDATION_BOARD_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: `${YOUTH_FOUNDATION_BOARD_URL}?bbsId=${YOUTH_FOUNDATION_BOARD_ID}`,
      'User-Agent': 'soilab-newsletter/1.0 (+https://soilab-youth.kr)',
    },
    body,
  });
  const boardItems = parseYouthFoundationBoard(await boardResponse.text(), {
    lookbackDays,
    now,
  }).slice(0, Math.max(limit * 2, 6));

  const programs = await Promise.all(
    boardItems.map(async (item): Promise<SupportProgram | null> => {
      const response = await fetchWithTimeout(item.url, {
        cache: 'no-store',
        headers: {
          Referer: `${YOUTH_FOUNDATION_BOARD_URL}?bbsId=${YOUTH_FOUNDATION_BOARD_ID}`,
          'User-Agent': 'soilab-newsletter/1.0 (+https://soilab-youth.kr)',
        },
      });
      const detail = extractYouthFoundationDetail(await response.text());
      const endDate = extractApplicationEndDate(`${item.title}\n${detail}`, item.publishedAt)
        ?? item.applicationEndDate;

      if (isExpired(endDate, now)) {
        return null;
      }

      return {
        id: `kyf:${item.id}`,
        title: item.title,
        url: item.url,
        source: '청년재단',
        description: truncateText(detail, 360),
        publishedAt: item.publishedAt,
        applicationPeriod: endDate
          ? `신청마감: ${formatDateKey(endDate)}`
          : `공고일: ${formatDateKey(item.publishedAt)}`,
        applicationEndDate: endDate,
      };
    })
  );

  return sortPrograms(programs.filter((program): program is SupportProgram => Boolean(program)))
    .slice(0, limit);
}

export function buildSupportProgramSummary(program: SupportProgram) {
  return [
    program.description,
    program.applicationPeriod,
    program.publishedAt ? `공고·업데이트: ${formatDateKey(program.publishedAt)}` : '',
  ]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 900);
}

export function getSupportProgramSummaryEndDate(summary: string) {
  const period = summary.match(
    /신청기간:\s*\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\s*~\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/u
  );
  const deadline = summary.match(
    /신청마감:\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/u
  );
  return dottedDateKey(period?.[1] ?? deadline?.[1] ?? '');
}

export function isSupportProgramSummaryExpired(summary: string, now = new Date()) {
  return isExpired(getSupportProgramSummaryEndDate(summary), now);
}

export async function collectSupportPrograms(options: CollectSupportProgramOptions = {}) {
  const limitPerSource = Math.max(1, Math.min(options.limitPerSource ?? 5, 10));
  const lookbackDays = Math.max(1, Math.min(options.lookbackDays ?? 90, 365));
  const now = options.now ?? new Date();
  const sources = [
    {
      name: '온통청년',
      collect: () => fetchYouthCenterPrograms(limitPerSource, now),
    },
    {
      name: '청년재단',
      collect: () => fetchYouthFoundationPrograms(limitPerSource, lookbackDays, now),
    },
  ];
  const results = await Promise.allSettled(sources.map((source) => source.collect()));
  const items: SupportProgram[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    } else {
      errors.push(`${sources[index].name}: ${String(result.reason)}`);
    }
  });

  return { items, errors };
}

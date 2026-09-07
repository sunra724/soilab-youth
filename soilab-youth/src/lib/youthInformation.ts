export interface YouthPolicyInformation {
  id: string;
  title: string;
  category: string;
  organization: string;
  region: string;
  applicationPeriod: string;
  deadlineAt: string;
  eligibility: string;
  benefit: string;
  application: string;
  sourceUrl: string;
  updatedAt: string;
}

export interface YouthContentInformation {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  sourceUrl: string;
}

export interface YouthCenterInformation {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  sourceUrl: string;
}

function recordValue(value: unknown) {
  return value && typeof value === 'object'
    ? value as Record<string, unknown>
    : null;
}

function textValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function compactText(value: unknown, maxLength = 180) {
  const text = textValue(value).replace(/\s+/gu, ' ');
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1).trim()}…`
    : text;
}

function safeHttpUrl(value: unknown) {
  const text = textValue(value);
  if (!text) return '';

  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : '';
  } catch {
    return '';
  }
}

function normalizeDate(value: string) {
  const match = value.match(/(\d{4})[.\-/]?(\d{2})[.\-/]?(\d{2})/u);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

function applicationPeriod(value: unknown) {
  const text = textValue(value);
  const dates = [...text.matchAll(/(\d{4})[.\-/]?(\d{2})[.\-/]?(\d{2})/gu)]
    .map((match) => `${match[1]}-${match[2]}-${match[3]}`);
  const startAt = dates[0] ?? '';
  const deadlineAt = dates[1] ?? dates[0] ?? '';

  return {
    label: startAt && deadlineAt
      ? `${startAt.replaceAll('-', '.')} ~ ${deadlineAt.replaceAll('-', '.')}`
      : '상시 또는 세부 일정은 원문 확인',
    deadlineAt,
  };
}

function policyRegion(zipCodeValue: unknown) {
  const codes = textValue(zipCodeValue)
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);
  if (codes.length === 0) return '전국';
  if (codes.every((code) => code.startsWith('27'))) return '대구';
  return '전국';
}

function isZeroAge(value: string) {
  return /^0+(?:\.0+)?$/u.test(value);
}

function ageEligibility(item: Record<string, unknown>) {
  const rawMinimum = textValue(item.sprtTrgtMinAge);
  const rawMaximum = textValue(item.sprtTrgtMaxAge);
  const minimum = isZeroAge(rawMinimum) ? '' : rawMinimum;
  const maximum = isZeroAge(rawMaximum) ? '' : rawMaximum;
  const additional = compactText(item.addAplyQlfcCndCn, 120);
  const age = rawMinimum && rawMaximum
    && isZeroAge(rawMinimum) && isZeroAge(rawMaximum)
    ? '연령 제한 없음'
    : minimum && maximum
      ? `만 ${minimum}~${maximum}세`
      : minimum
        ? `만 ${minimum}세 이상`
        : maximum
          ? `만 ${maximum}세 이하`
          : '';
  return [age, additional].filter(Boolean).join(' · ');
}

export function youthPolicyFrom(value: unknown): YouthPolicyInformation | null {
  const item = recordValue(value);
  if (!item) return null;

  const id = textValue(item.plcyNo);
  const title = compactText(item.plcyNm, 140);
  if (!id || !title) return null;

  const period = applicationPeriod(item.aplyYmd);

  return {
    id,
    title,
    category: [textValue(item.lclsfNm), textValue(item.mclsfNm)]
      .filter(Boolean)
      .join(' · '),
    organization: textValue(item.operInstCdNm)
      || textValue(item.sprvsnInstCdNm)
      || '운영기관은 원문 확인',
    region: policyRegion(item.zipCd),
    applicationPeriod: period.label,
    deadlineAt: period.deadlineAt,
    eligibility: ageEligibility(item) || '자세한 신청 조건은 원문 확인',
    benefit: compactText(item.plcySprtCn || item.plcyExplnCn, 180)
      || '지원 내용은 원문 확인',
    application: compactText(item.plcyAplyMthdCn, 140)
      || '신청 방법은 원문 확인',
    sourceUrl:
      `https://www.youthcenter.go.kr/youthPolicy/ythPlcyTotalSearch/ythPlcyDetail/${encodeURIComponent(id)}`,
    updatedAt: normalizeDate(textValue(item.lastMdfcnDt)),
  };
}

const CORE_ISOLATION_PATTERN = /고립|은둔|사회적\s*고립|외톨이|고독|쉬었음|구직\s*단념|구직\s*포기|니트(?:족)?|NEET|장기\s*미취업|일상\s*회복|사회\s*복귀/iu;

const MENTAL_RECOVERY_PATTERN = /정신\s*건강|마음\s*건강|심리\s*(?:상담|치료|회복|지원)|정서\s*(?:상담|치료|회복|지원)/iu;

const DIRECT_RELEVANCE_PATTERN = new RegExp(
  `${CORE_ISOLATION_PATTERN.source}|${MENTAL_RECOVERY_PATTERN.source}`,
  'iu',
);

const INSTITUTIONAL_POLICY_PATTERN = /직업계고\s*[-·~]\s*전문대학|직업계고.{0,20}교육과정\s*연계|(?:운영|수행|참여)\s*기관\s*(?:모집|공모|선정)|(?:대학|전문대학|학교|기관)(?:이|가|에서)\s*(?:신청|공모)|대학별\s*신청/iu;

const UNRELATED_SPECIAL_TARGET_PATTERN = /병역\s*의무|입영\s*대상|군\s*복무|이주\s*배경|다문화|농업인|영농|체육\s*인|예술\s*인/iu;

export function isDirectlyRelevantYouthPolicy(item: YouthPolicyInformation) {
  const haystack = [
    item.title,
    item.category,
    item.eligibility,
    item.benefit,
    item.application,
  ].join(' ');
  const directlyAddressesIsolation = CORE_ISOLATION_PATTERN.test(haystack);
  const supportsMentalRecovery = MENTAL_RECOVERY_PATTERN.test(haystack);
  const isUnrelatedSpecialTarget = UNRELATED_SPECIAL_TARGET_PATTERN.test(haystack);
  return (directlyAddressesIsolation || (supportsMentalRecovery && !isUnrelatedSpecialTarget))
    && !INSTITUTIONAL_POLICY_PATTERN.test(haystack);
}

function policyScore(item: YouthPolicyInformation) {
  const relevantTerms = new RegExp(DIRECT_RELEVANCE_PATTERN.source, 'giu');
  const haystack = [
    item.title,
    item.category,
    item.eligibility,
    item.benefit,
    item.application,
  ].join(' ');
  const matches = haystack.match(relevantTerms)?.length ?? 0;
  return (item.region === '대구' ? 40 : 10)
    + Math.min(matches, 5) * 4
    + (item.deadlineAt ? 2 : 0);
}

export function selectYouthPolicies(
  values: unknown[],
  today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
  }).format(new Date()),
) {
  const selected = values
    .map(youthPolicyFrom)
    .filter((item): item is YouthPolicyInformation => item !== null)
    .filter((item) => !item.deadlineAt || item.deadlineAt >= today)
    .filter(isDirectlyRelevantYouthPolicy)
    .sort((left, right) => (
      policyScore(right) - policyScore(left)
      || right.updatedAt.localeCompare(left.updatedAt)
    ));

  const seen = new Set<string>();
  return selected.filter((item) => {
    const normalizedTitle = item.title
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '');
    const duplicateKey = /심리상담/u.test(normalizedTitle)
      && /바우처|마음투자/u.test(normalizedTitle)
      ? '심리상담-바우처'
      : normalizedTitle;
    if (seen.has(duplicateKey)) return false;
    seen.add(duplicateKey);
    return true;
  });
}

export function youthContentFrom(value: unknown): YouthContentInformation | null {
  const item = recordValue(value);
  if (!item) return null;

  const boardId = textValue(item.bbsSn);
  const postId = textValue(item.pstSn);
  const sectionId = textValue(item.pstSeSn);
  const title = compactText(item.pstTtl, 140);
  if (!boardId || !postId || !title) return null;

  const path = [
    boardId,
    postId,
    sectionId,
  ].filter(Boolean).map(encodeURIComponent).join('/');

  return {
    id: `${boardId}-${postId}`,
    title,
    category: textValue(item.pstSeNm) || '청년정보',
    publishedAt: normalizeDate(textValue(item.frstRegDt)),
    sourceUrl: `https://www.youthcenter.go.kr/bbs01View/${path}`,
  };
}

export function selectYouthContents(values: unknown[]) {
  return values
    .map(youthContentFrom)
    .filter((item): item is YouthContentInformation => item !== null)
    .filter((item) => (
      item.category !== '알림'
      && !/\[완료\]|정상화 알림|시스템 점검/gu.test(item.title)
    ))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function normalizeKoreanPhone(value: unknown) {
  const digits = textValue(value).replace(/\D/gu, '');
  if (!digits) return '';

  if (/^02\d{7,8}$/u.test(digits)) {
    const middleLength = digits.length - 6;
    return `02-${digits.slice(2, 2 + middleLength)}-${digits.slice(-4)}`;
  }

  if (/^0(?:3[1-3]|4[1-4]|5[1-5]|6[1-4])\d{7}$/u.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (/^(?:01[016789]|070)\d{7,8}$/u.test(digits)) {
    const middleLength = digits.length - 7;
    return `${digits.slice(0, 3)}-${digits.slice(3, 3 + middleLength)}-${digits.slice(-4)}`;
  }

  if (/^(?:15|16|18)\d{6}$/u.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return '';
}

export function youthCenterFrom(value: unknown): YouthCenterInformation | null {
  const item = recordValue(value);
  if (!item || textValue(item.stdgCtpvCd) !== '27') return null;

  const id = textValue(item.cntrSn);
  const name = compactText(item.cntrNm, 100);
  if (!id || !name) return null;

  const detailAddress = textValue(item.cntrDaddr);
  const address = [
    textValue(item.cntrAddr),
    detailAddress === '없음' ? '' : detailAddress,
  ].filter(Boolean).join(' ');

  return {
    id,
    name,
    district: textValue(item.stdgSggCdNm) || '대구',
    address,
    phone: normalizeKoreanPhone(item.cntrTelno),
    sourceUrl: safeHttpUrl(item.cntrUrlAddr)
      || 'https://www.youthcenter.go.kr/youthApply/ythCenter/ythCenterMain',
  };
}

export function selectYouthCenters(values: unknown[]) {
  return values
    .map(youthCenterFrom)
    .filter((item): item is YouthCenterInformation => item !== null)
    .sort((left, right) => {
      const leftPriority = left.district === '북구' ? 0 : 1;
      const rightPriority = right.district === '북구' ? 0 : 1;
      return leftPriority - rightPriority
        || left.district.localeCompare(right.district, 'ko')
        || left.name.localeCompare(right.name, 'ko');
    });
}

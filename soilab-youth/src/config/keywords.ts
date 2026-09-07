export const CORE_KEYWORDS = [
  '고립',
  '은둔',
  '은둔형 외톨이',
  '히키코모리',
  '사회적 고립',
  '관계 단절',
  '니트',
  'NEET',
  '쉬었음 청년',
  '구직단념',
  '사회적 처방',
  '청년 마음건강',
  '자립준비청년',
  '경계선지능',
  '고립가구',
] as const;

export const SUPPLEMENTARY_KEYWORDS = [
  '청년정책',
  '청년센터',
  '정신건강복지센터',
  '지역사회 통합돌봄',
  '청년도전지원사업',
  '사회적 고립 실태조사',
] as const;

export const EXCLUDED_KEYWORDS = [
  'ESG',
  '사회적가치 측정',
  '사회적 가치 측정',
  'SPC',
  '사회성과인센티브',
  '임팩트투자',
  '임팩트 투자',
  '기부',
  '후원',
  '성금',
  '기탁',
  '봉사',
  '협약 체결',
  '업무협약',
  'MOU',
  '채용 공고',
  '채용공고',
  '선거 공약',
  '소설',
  '영화',
  '드라마',
  '연극',
  '공연',
  '전시',
  '웹툰',
  '프로야구',
  '야구',
  '축구',
  '농구',
  '배구',
  'KBO',
  '선수',
  '주전',
  '홈런',
  '타율',
] as const;

export const SENSITIVE_KEYWORDS = [
  '극단적 선택',
  '자살',
  '자해',
  '목숨을 끊',
  '숨진 채',
  '유서',
  '투신',
  '동반자살',
  '고독사',
] as const;

export const STIGMATIZING_KEYWORDS = [
  '히키코모리',
  '폐인',
  '방구석',
] as const;

export const NEWS_SEARCH_QUERIES = [
  '고립 청년',
  '은둔 청년',
  '은둔형 외톨이',
  '사회적 고립 청년',
  '관계 단절 청년',
  '니트 청년',
  'NEET 청년',
  '쉬었음 청년',
  '구직단념 청년',
  '사회적 처방 청년',
  '청년 마음건강',
  '자립준비청년',
  '경계선지능 청년',
  '고립가구',
] as const;

export const REGISTERED_PRESS_SOURCES = [
  '연합뉴스',
  '뉴시스',
  '뉴스1',
  'KBS 뉴스',
  'MBC 뉴스',
  'SBS 뉴스',
  'YTN',
  'JTBC',
  '한겨레',
  '경향신문',
  '한국일보',
  '서울신문',
  '동아일보',
  '중앙일보',
  '조선일보',
  '문화일보',
  '국민일보',
  '세계일보',
  '매일경제',
  '한국경제',
  '머니투데이',
  '이데일리',
  '아시아경제',
  '헤럴드경제',
  '파이낸셜뉴스',
  '데일리안',
  '뉴스핌',
  '노컷뉴스',
  '오마이뉴스',
  '프레시안',
  '비마이너',
  '복지타임즈',
  '웰페어뉴스',
  '에이블뉴스',
  '매일신문',
  '영남일보',
  '대구일보',
  '경북일보',
  '강원일보',
  '부산일보',
  '국제신문',
  '광주일보',
  '전남일보',
  '전북일보',
  '제주일보',
  '경인일보',
  '경기일보',
  '중부일보',
  '충청일보',
  '충청투데이',
  '대전일보',
  '충청타임즈',
] as const;

export const REGISTERED_PRESS_DOMAINS = [
  'yna.co.kr',
  'newsis.com',
  'news1.kr',
  'kbs.co.kr',
  'imbc.com',
  'sbs.co.kr',
  'ytn.co.kr',
  'jtbc.co.kr',
  'hani.co.kr',
  'khan.co.kr',
  'hankookilbo.com',
  'seoul.co.kr',
  'donga.com',
  'joongang.co.kr',
  'chosun.com',
  'munhwa.com',
  'kmib.co.kr',
  'segye.com',
  'mk.co.kr',
  'hankyung.com',
  'mt.co.kr',
  'edaily.co.kr',
  'asiae.co.kr',
  'heraldcorp.com',
  'fnnews.com',
  'dailian.co.kr',
  'newspim.com',
  'nocutnews.co.kr',
  'ohmynews.com',
  'pressian.com',
  'beminor.com',
  'bokjitimes.com',
  'welfarenews.net',
  'ablenews.co.kr',
  'imaeil.com',
  'yeongnam.com',
  'idaegu.com',
  'kyongbuk.co.kr',
  'kwnews.co.kr',
  'busan.com',
  'kookje.co.kr',
  'kwangju.co.kr',
  'jnilbo.com',
  'jjan.kr',
  'jejunews.com',
  'kyeongin.com',
  'kyeonggi.com',
  'joongboo.com',
  'ccdailynews.com',
  'cctoday.co.kr',
  'daejonilbo.com',
  'cctimes.kr',
] as const;

export const PORTAL_OR_AGGREGATOR_DOMAINS = [
  'news.google.com',
  'v.daum.net',
  'news.nate.com',
  'nate.com',
  'news.naver.com',
  'm.news.naver.com',
  'youtube.com',
  'youtu.be',
] as const;

const YOUTH_CONTEXT = [
  '청년',
  '청소년',
  '청년층',
  '청년도전',
  '자립준비',
  '경계선지능',
  '구직단념',
  '쉬었음',
  '니트',
  'NEET',
  '은둔형 외톨이',
  '히키코모리',
  '고립가구',
  '사회적 처방',
] as const;

const ALWAYS_REJECT_SENSITIVE_TITLE = [
  '숨진 채',
  '유서',
  '투신',
  '동반자살',
  '목매',
  '번개탄',
  '농약',
  '옥상',
  '선로',
] as const;

const PERSONAL_CONTENT_MARKERS = [
  '브이로그',
  'VLOG',
  '개인방송',
  '쇼츠',
  'SHORTS',
  '일상 공개',
  '후기 영상',
] as const;

function normalized(value: string) {
  return value
    .normalize('NFKC')
    .replaceAll('·', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ko-KR');
}

function includesAny(value: string, keywords: readonly string[]) {
  const haystack = normalized(value);
  return keywords.some((keyword) => haystack.includes(normalized(keyword)));
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function matchesDomain(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function hasCoreKeyword(value: string) {
  return includesAny(value, CORE_KEYWORDS);
}

export function hasYouthContext(value: string) {
  return includesAny(value, YOUTH_CONTEXT);
}

export function isRegisteredPressSource(source: string) {
  const value = normalized(source);
  return REGISTERED_PRESS_SOURCES.some((allowed) => value === normalized(allowed));
}

export function isRegisteredPressUrl(url: string) {
  const host = hostname(url);
  return REGISTERED_PRESS_DOMAINS.some((domain) => matchesDomain(host, domain));
}

export function isRegisteredPressSourceUrlPair(source: string, url: string) {
  const value = normalized(source);
  const sourceIndex = REGISTERED_PRESS_SOURCES.findIndex(
    (allowed) => value === normalized(allowed),
  );
  if (sourceIndex < 0) return false;

  const expectedDomain = REGISTERED_PRESS_DOMAINS[sourceIndex];
  return matchesDomain(hostname(url), expectedDomain);
}

export function isPortalOrAggregatorUrl(url: string) {
  const host = hostname(url);
  return PORTAL_OR_AGGREGATOR_DOMAINS.some((domain) => matchesDomain(host, domain));
}

export function isPressReleaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return matchesDomain(
      parsed.hostname.toLowerCase().replace(/^www\./, ''),
      'yna.co.kr',
    ) && /^\/view\/RPR/iu.test(parsed.pathname);
  } catch {
    return false;
  }
}

export type NewsPolicyStatus = 'accepted' | 'review' | 'rejected';

export interface NewsPolicyResult {
  status: NewsPolicyStatus;
  reason: string;
}

export interface NewsPolicyInput {
  title: string;
  description?: string;
  source?: string;
  url?: string;
  requirePublisher?: boolean;
  allowReviewedSensitive?: boolean;
}

export function assessNewsPolicy(input: NewsPolicyInput): NewsPolicyResult {
  const title = input.title.trim();
  const combined = `${title} ${input.description ?? ''}`;
  const upperTitle = normalized(title);

  if (
    /^\s*\[영상\]/u.test(title)
    || includesAny(title, ['영상', '동영상'])
    || includesAny(combined, PERSONAL_CONTENT_MARKERS)
  ) {
    return { status: 'rejected', reason: '영상·개인 채널 콘텐츠' };
  }

  if (!hasCoreKeyword(combined)) {
    return { status: 'rejected', reason: '핵심 키워드 없음' };
  }

  const onlyBroadIsolation =
    includesAny(combined, ['고립', '은둔'])
    && !includesAny(combined, CORE_KEYWORDS.filter((keyword) =>
      !['고립', '은둔'].includes(keyword)
    ));
  if (onlyBroadIsolation && !hasYouthContext(combined)) {
    return { status: 'rejected', reason: '청년 맥락 없는 동음이의 보도' };
  }

  if (includesAny(combined, EXCLUDED_KEYWORDS)) {
    return { status: 'rejected', reason: '제외 주제' };
  }

  if (input.url) {
    if (isPortalOrAggregatorUrl(input.url)) {
      return { status: 'rejected', reason: '포털·재배포 링크' };
    }
    if (isPressReleaseUrl(input.url)) {
      return { status: 'rejected', reason: '언론사 도메인 내 보도자료' };
    }
    if (input.requirePublisher && !isRegisteredPressUrl(input.url)) {
      return { status: 'rejected', reason: '등록 언론사 허용목록 밖 링크' };
    }
  }

  if (
    input.requirePublisher
    && input.source
    && !isRegisteredPressSource(input.source)
  ) {
    return { status: 'rejected', reason: '등록 언론사 허용목록 밖 출처' };
  }
  if (
    input.requirePublisher
    && input.source
    && input.url
    && !isRegisteredPressSourceUrlPair(input.source, input.url)
  ) {
    return { status: 'rejected', reason: '출처와 원문 도메인 불일치' };
  }

  if (includesAny(title, ALWAYS_REJECT_SENSITIVE_TITLE)) {
    return { status: 'rejected', reason: '자해·자살 방법 또는 사건 묘사가 포함된 제목' };
  }

  const needsReview =
    includesAny(combined, SENSITIVE_KEYWORDS)
    || includesAny(combined, STIGMATIZING_KEYWORDS);
  if (needsReview && !input.allowReviewedSensitive) {
    return { status: 'review', reason: '민감 보도 수동 검수 필요' };
  }

  if (!upperTitle) {
    return { status: 'rejected', reason: '빈 제목' };
  }

  return { status: 'accepted', reason: '공개 기준 충족' };
}

export function classifyNewsCategory(value: string) {
  if (includesAny(value, [
    '자립준비청년',
    '경계선지능',
    '청년 마음건강',
    '사회적 처방',
    '청년도전지원사업',
  ])) {
    return '청년지원';
  }
  return '고립은둔';
}

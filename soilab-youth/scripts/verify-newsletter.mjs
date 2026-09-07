import { performance } from 'node:perf_hooks';
import { isIP } from 'node:net';
import { NEWSLETTER_PUBLIC_RELEASE } from '../src/config/newsletterRelease.js';

const baseUrl = (process.argv[2] ?? 'https://www.soilab-youth.kr').replace(/\/+$/u, '');
const newsletterUrl = `${baseUrl}/newsletter`;
const canonicalOrigin = 'https://www.soilab-youth.kr';
const checks = [];

async function request(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'soilab-newsletter-verifier/1.0',
        ...headers,
      },
      signal: controller.signal,
    });
    return {
      response,
      text: await response.text(),
      elapsedMs: performance.now() - startedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function check(label, passed, detail = '') {
  checks.push({ label, passed, detail });
  const status = passed ? 'OK  ' : 'FAIL';
  console.log(`  ${status} ${label}${detail ? ` (${detail})` : ''}`);
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function metadataContent(value, attribute, name) {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}="${name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}"[^>]*content="([^"]*)"[^>]*>`,
    'u',
  );
  return value.match(pattern)?.[1] ?? '';
}

console.log('== 다시봄 뉴스클리핑 공개 URL 검증 ==');
console.log(`URL: ${newsletterUrl}`);

let plain;
let cacheBust;

try {
  plain = await request(newsletterUrl);
  cacheBust = await request(`${newsletterUrl}?cb=${Date.now()}`);
} catch (error) {
  console.error(`FAIL: 15초 내 응답 없음 — ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const html = cacheBust.text;
const releaseAttribute = `data-newsletter-release="${NEWSLETTER_PUBLIC_RELEASE}"`;
const clippingCount = countMatches(html, /data-newsletter-item="clipping"/gu);
const checkboxCount = countMatches(html, /type="checkbox"/gu);
const youthPolicyCount = countMatches(html, /data-youth-policy(?:=|>|\s)/gu);
const youthContentCount = countMatches(html, /data-youth-content(?:=|>|\s)/gu);
const youthCenterCount = countMatches(html, /data-youth-center(?:=|>|\s)/gu);
const detailMatch = html.match(/href="(\/newsletter\/\d{4}-\d{2}-\d{2})"/u);
const newsletterCanonical = html.match(/<link rel="canonical" href="([^"]*)"/u)?.[1] ?? '';
const newsletterOgImage = metadataContent(html, 'property', 'og:image');

check('일반 URL 200 응답', plain.response.status === 200, `HTTP ${plain.response.status}`);
check('캐시 우회 URL 200 응답', cacheBust.response.status === 200, `HTTP ${cacheBust.response.status}`);
check('일반 URL 5초 이내', plain.elapsedMs <= 5_000, `${(plain.elapsedMs / 1_000).toFixed(3)}초`);
check('캐시 우회 URL 5초 이내', cacheBust.elapsedMs <= 5_000, `${(cacheBust.elapsedMs / 1_000).toFixed(3)}초`);
check(
  '일반·캐시 우회 모두 최신 릴리스',
  plain.text.includes(releaseAttribute) && html.includes(releaseAttribute),
  NEWSLETTER_PUBLIC_RELEASE,
);
check('[영상] 항목 0건', !html.includes('[영상]'));
check(
  '포털 링크·네이트 표기 0건',
  !/v\.daum\.net|n\.news\.naver\.com|news\.naver\.com|news\.nate\.com|>네이트</u.test(html),
);
check('상담 안내(109) 노출', html.includes('자살예방상담전화') && html.includes('109'));
check('소이랩 상담전화 오인 요소 제거', !html.includes('053-941-9003'));
check('저작권 고지 노출', html.includes('기사의 저작권은 각 언론사에 있으며'));
check('건수 고정 문구 제거', !html.includes('5건을 묶었습니다'));
check('키워드 설명 갱신', !html.includes('사회적가치·청년지원 키워드'));
check('미완성 콘텐츠 비공개', !html.includes('발행일 준비 중'));
check('전화번호 오타 없음', !html.includes('tel:05394194903'));
check('빈 기관 소식 안내 숨김', !html.includes('등록된 기관 소식이 아직 없습니다.'));
check('연령 0~0 표기 없음', !/만\s*0~0세/u.test(html));
check(
  '형식이 잘못된 센터 전화번호 숨김',
  !html.includes('053-6432-0312') && !html.includes('tel:05364320312'),
);
check('목록 항목 20개 이하', clippingCount <= 20, `${clippingCount}개`);
check('필수 동의 체크박스 2개', checkboxCount === 2, `${checkboxCount}개`);
check('온통청년 API 섹션 노출', (
  html.includes('청년정책·콘텐츠·대구 청년센터')
  && html.includes('data-youth-api-source="ontong"')
  && html.includes('온통청년 공식 OPEN API')
));
check(
  '청년정책 API 자료 1~6건',
  youthPolicyCount >= 1 && youthPolicyCount <= 6,
  `${youthPolicyCount}개`,
);
check(
  '일반 취업·기관 대상 정책 제외',
  !html.includes('청년도약 인재양성 부트캠프')
    && !html.includes('k-뉴딜 아카데미')
    && !html.includes('직업계고-전문대학 교육과정 연계'),
);
check(
  '대구 정책이 없으면 안내 표시',
  !html.includes('>전국</span>')
    || html.includes('>대구</span>')
    || html.includes('현재 표시할 대구 정책이 없어 전국 정책만 안내합니다.'),
);
check(
  '청년콘텐츠 API 자료 1~4건',
  youthContentCount >= 1 && youthContentCount <= 4,
  `${youthContentCount}개`,
);
check(
  '대구 청년센터 API 자료 1~6건',
  youthCenterCount >= 1 && youthCenterCount <= 6,
  `${youthCenterCount}개`,
);
check('이전 정책 레이더 대기 문구 제거', !html.includes('정책 레이더의 OneGov'));
check(
  '뉴스레터 canonical·og:url 자기 경로',
  newsletterCanonical === `${canonicalOrigin}/newsletter`
    && metadataContent(html, 'property', 'og:url') === `${canonicalOrigin}/newsletter`,
  newsletterCanonical,
);
check(
  '뉴스레터 OG 전체 필드 유지',
  metadataContent(html, 'property', 'og:type') === 'website'
    && metadataContent(html, 'property', 'og:locale') === 'ko_KR'
    && metadataContent(html, 'property', 'og:site_name').length > 0,
);
check(
  '뉴스레터 1200×630 공유 이미지',
  newsletterOgImage.length > 0
    && metadataContent(html, 'property', 'og:image:width') === '1200'
    && metadataContent(html, 'property', 'og:image:height') === '630'
    && metadataContent(html, 'name', 'twitter:card') === 'summary_large_image',
  newsletterOgImage,
);
check(
  'Google Analytics 쿼리스트링 제외',
  html.includes('page_location: location.origin + location.pathname'),
);

const privacy = await request(`${baseUrl}/newsletter/privacy`);
check('개인정보 안내 페이지 200', privacy.response.status === 200, `HTTP ${privacy.response.status}`);
check(
  '개인정보 안내 canonical 자기 경로',
  privacy.text.includes(`rel="canonical" href="${canonicalOrigin}/newsletter/privacy"`),
);

const unsubscribe = await request(
  `${baseUrl}/unsubscribe?email=test%40example.com&token=prelaunch-check`,
);
check('수신거부 페이지 200', unsubscribe.response.status === 200, `HTTP ${unsubscribe.response.status}`);
check(
  '수신거부 noindex·nofollow',
  metadataContent(unsubscribe.text, 'name', 'robots')
    .split(',')
    .map((item) => item.trim())
    .includes('noindex')
    && metadataContent(unsubscribe.text, 'name', 'robots')
      .split(',')
      .map((item) => item.trim())
      .includes('nofollow'),
);
check(
  '수신거부 canonical 자기 경로',
  unsubscribe.text.includes(`rel="canonical" href="${canonicalOrigin}/unsubscribe"`),
);

const rootOgImage = await request(`${baseUrl}/opengraph-image`);
const newsletterImage = await request(`${baseUrl}/newsletter/opengraph-image`);
check(
  '홈 OG 이미지 PNG 응답',
  rootOgImage.response.status === 200
    && rootOgImage.response.headers.get('content-type')?.startsWith('image/png'),
  `HTTP ${rootOgImage.response.status}`,
);
check(
  '뉴스레터 OG 이미지 PNG 응답',
  newsletterImage.response.status === 200
    && newsletterImage.response.headers.get('content-type')?.startsWith('image/png'),
  `HTTP ${newsletterImage.response.status}`,
);

if (detailMatch) {
  const detail = await request(`${baseUrl}${detailMatch[1]}`);
  const base = new URL(baseUrl);
  const canToggleWww = isIP(base.hostname) === 0 && base.hostname !== 'localhost';
  const alternateHost = canToggleWww
    ? base.hostname.startsWith('www.')
      ? base.hostname.replace(/^www\./u, '')
      : `www.${base.hostname}`
    : '';
  const alternateDetail = canToggleWww
    ? await request(`${base.protocol}//${alternateHost}${detailMatch[1]}`)
    : null;
  const socialDetail = await request(`${baseUrl}${detailMatch[1]}`, {
    'User-Agent': 'facebookexternalhit/1.1',
  });
  const articleCount = countMatches(
    detail.text,
    /<li[^>]*data-newsletter-article/gu,
  );
  const alternateArticleCount = countMatches(
    alternateDetail?.text ?? '',
    /<li[^>]*data-newsletter-article/gu,
  );
  check(
    '날짜형 회차 상세 URL 200',
    detail.response.status === 200,
    `${detailMatch[1]} → HTTP ${detail.response.status}`,
  );
  check(
    '회차 기사 1~7건',
    articleCount >= 1 && articleCount <= 7,
    `${articleCount}개`,
  );
  check(
    'www 유무와 관계없이 회차 표시',
    !alternateDetail || (
      alternateDetail.response.status === 200
        && alternateArticleCount === articleCount
        && alternateArticleCount > 0
    ),
    alternateDetail
      ? `${alternateHost} · ${alternateArticleCount}개`
      : '로컬 주소는 호스트 전환 생략',
  );
  check(
    '회차 원문 링크가 언론사 직링크',
    !/news\.google\.com|v\.daum\.net|n\.news\.naver\.com|news\.nate\.com/u
      .test(detail.text),
  );
  check(
    '회차 상담·저작권 안내',
    detail.text.includes('109')
      && detail.text.includes('기사의 저작권은 각 언론사에 있으며')
      && !detail.text.includes('053-941-9003'),
  );
  check(
    '회차 OG·Twitter 공유 메타데이터',
    socialDetail.text.includes('property="og:title"')
      && socialDetail.text.includes('property="og:description"')
      && socialDetail.text.includes('property="og:url"')
      && socialDetail.text.includes('name="twitter:card"')
      && socialDetail.text.includes('다시봄 뉴스클리핑'),
  );
  check(
    '회차 canonical·og:url 자기 경로',
    detail.text.includes(
      `rel="canonical" href="${canonicalOrigin}${detailMatch[1]}"`,
    )
      && metadataContent(detail.text, 'property', 'og:url')
        === `${canonicalOrigin}${detailMatch[1]}`,
  );
  check(
    '회차 1200×630 공유 이미지',
    metadataContent(detail.text, 'property', 'og:image').length > 0
      && metadataContent(detail.text, 'property', 'og:image:width') === '1200'
      && metadataContent(detail.text, 'property', 'og:image:height') === '630'
      && metadataContent(detail.text, 'name', 'twitter:card') === 'summary_large_image',
  );
} else {
  check('날짜형 회차 상세 URL 존재', false, '공개 아카이브 0건');
}

const failed = checks.filter((item) => !item.passed);
console.log('');
console.log(failed.length === 0 ? 'PASS' : `FAIL — ${failed.length}개 항목 확인 필요`);
process.exit(failed.length === 0 ? 0 : 1);

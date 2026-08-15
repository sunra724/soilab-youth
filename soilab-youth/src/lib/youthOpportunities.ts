import 'server-only';

import { unstable_cache } from 'next/cache';
import {
  selectYouthCenters,
  selectYouthContents,
  selectYouthPolicies,
  type YouthCenterInformation,
  type YouthContentInformation,
  type YouthPolicyInformation,
} from './youthInformation';

const API_BASE_URL = 'https://www.youthcenter.go.kr/go/ythip/';
const API_TIMEOUT_MS = 8_000;
const API_REVALIDATE_SECONDS = 21_600;
const DAEGU_DISTRICT_CODES = [
  '27110',
  '27140',
  '27170',
  '27200',
  '27230',
  '27260',
  '27290',
  '27710',
  '27720',
].join(',');

interface OfficialApiPayload {
  resultCode?: number | string;
  resultMessage?: string;
  result?: {
    youthPolicyList?: unknown[];
  };
}

async function fetchOfficialApi(params: {
  path: 'getPlcy' | 'getContent' | 'getSpace';
  apiKey: string | undefined;
  query: Record<string, string>;
  label: string;
}) {
  if (!params.apiKey) {
    throw new Error(`${params.label} 인증키 미설정`);
  }

  const url = new URL(params.path, API_BASE_URL);
  url.searchParams.set('apiKeyNm', params.apiKey);
  url.searchParams.set('pageNum', '1');
  url.searchParams.set('rtnType', 'json');
  for (const [key, value] of Object.entries(params.query)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Soilab-Dasibom/1.0',
    },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${params.label} 응답 ${response.status}`);
  }

  const payload = await response.json() as OfficialApiPayload;
  if (
    Number(payload.resultCode) !== 200
    || !Array.isArray(payload.result?.youthPolicyList)
  ) {
    throw new Error(`${params.label} 응답 형식 오류`);
  }
  return payload.result.youthPolicyList;
}

const getCachedYouthPolicies = unstable_cache(
  async () => selectYouthPolicies(await fetchOfficialApi({
    path: 'getPlcy',
    apiKey: process.env.ONTONG_YOUTH_POLICY_API_KEY,
    query: {
      pageSize: '300',
      zipCd: DAEGU_DISTRICT_CODES,
    },
    label: '청년정책 API',
  })).slice(0, 6),
  ['ontong-youth-policies-normalized-v2', DAEGU_DISTRICT_CODES, 'page-size-300'],
  {
    revalidate: API_REVALIDATE_SECONDS,
    tags: ['ontong-youth-policies'],
  },
);

const getCachedYouthContents = unstable_cache(
  async () => selectYouthContents(await fetchOfficialApi({
    path: 'getContent',
    apiKey: process.env.ONTONG_YOUTH_CONTENT_API_KEY,
    query: { pageSize: '5' },
    label: '청년콘텐츠 API',
  })).slice(0, 4),
  ['ontong-youth-content-normalized-v1', 'page-size-5'],
  {
    revalidate: API_REVALIDATE_SECONDS,
    tags: ['ontong-youth-content'],
  },
);

const getCachedYouthCenters = unstable_cache(
  async () => selectYouthCenters(await fetchOfficialApi({
    path: 'getSpace',
    apiKey: process.env.ONTONG_YOUTH_CENTER_API_KEY,
    query: { pageSize: '300' },
    label: '청년센터 API',
  })).slice(0, 6),
  ['ontong-youth-centers-normalized-v1', 'daegu', 'page-size-300'],
  {
    revalidate: API_REVALIDATE_SECONDS,
    tags: ['ontong-youth-centers'],
  },
);

function errorMessage(label: string, reason: unknown) {
  const message = reason instanceof Error ? reason.message : '알 수 없는 오류';
  console.error(`[newsletter] ${label}: ${message}`);
  return `${label} 정보를 잠시 불러오지 못했습니다.`;
}

export async function getYouthOpportunities() {
  const requests = await Promise.allSettled([
    getCachedYouthPolicies(),
    getCachedYouthContents(),
    getCachedYouthCenters(),
  ]);

  const errors: string[] = [];
  let policies: YouthPolicyInformation[] = [];
  let contents: YouthContentInformation[] = [];
  let centers: YouthCenterInformation[] = [];

  if (requests[0].status === 'fulfilled') {
    policies = requests[0].value;
  } else {
    errors.push(errorMessage('청년정책 API', requests[0].reason));
  }

  if (requests[1].status === 'fulfilled') {
    contents = requests[1].value;
  } else {
    errors.push(errorMessage('청년콘텐츠 API', requests[1].reason));
  }

  if (requests[2].status === 'fulfilled') {
    centers = requests[2].value;
  } else {
    errors.push(errorMessage('청년센터 API', requests[2].reason));
  }

  return {
    policies,
    contents,
    centers,
    fetchedAt: new Date().toISOString(),
    sourceName: '온통청년 공식 OPEN API',
    errors,
  };
}

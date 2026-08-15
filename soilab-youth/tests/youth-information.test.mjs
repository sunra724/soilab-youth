import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeKoreanPhone,
  selectYouthCenters,
  selectYouthContents,
  selectYouthPolicies,
  youthCenterFrom,
  youthContentFrom,
  youthPolicyFrom,
} from '../src/lib/youthInformation.ts';

test('청년정책 응답을 공개 카드 형식과 공식 상세 URL로 변환한다', () => {
  const policy = youthPolicyFrom({
    plcyNo: 'R202607290001',
    plcyNm: '대구 청년 마음회복 지원',
    lclsfNm: '복지문화',
    mclsfNm: '건강',
    operInstCdNm: '대구광역시',
    zipCd: '27230,27260',
    aplyYmd: '20260701 ~ 20261231',
    sprtTrgtMinAge: '19',
    sprtTrgtMaxAge: '39',
    addAplyQlfcCndCn: '대구 거주 청년',
    plcySprtCn: '마음건강 상담과 일상 회복 프로그램',
    plcyAplyMthdCn: '온라인 신청',
    lastMdfcnDt: '2026-07-29',
  });

  assert.ok(policy);
  assert.equal(policy.region, '대구');
  assert.equal(policy.applicationPeriod, '2026.07.01 ~ 2026.12.31');
  assert.equal(policy.deadlineAt, '2026-12-31');
  assert.match(policy.eligibility, /만 19~39세/u);
  assert.equal(
    policy.sourceUrl,
    'https://www.youthcenter.go.kr/youthPolicy/ythPlcyTotalSearch/ythPlcyDetail/R202607290001',
  );
});

test('마감된 정책을 제외하고 대구·회복 관련 정책을 먼저 고른다', () => {
  const selected = selectYouthPolicies([
    {
      plcyNo: 'expired',
      plcyNm: '마감 정책',
      zipCd: '27230',
      aplyYmd: '20260101 ~ 20260131',
    },
    {
      plcyNo: 'national',
      plcyNm: '전국 청년 마음건강 프로그램',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'daegu',
      plcyNm: '대구 고립청년 마음 회복과 일자리 지원',
      zipCd: '27230',
      aplyYmd: '20260701 ~ 20261231',
    },
  ], '2026-07-29');

  assert.deepEqual(selected.map((item) => item.id), ['daegu', 'national']);
});

test('일반 취업·교육 정책과 기관 신청 사업은 공개 정책에서 제외한다', () => {
  const selected = selectYouthPolicies([
    {
      plcyNo: 'bootcamp',
      plcyNm: '청년도약 인재양성 부트캠프',
      plcySprtCn: 'AI·반도체·이차전지 첨단산업 교육',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'academy',
      plcyNm: 'k-뉴딜 아카데미',
      plcySprtCn: '청년 취업 교육과 일자리 연계',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'institution',
      plcyNm: '직업계고-전문대학 교육과정 연계',
      addAplyQlfcCndCn: '전문대학이 신청하는 기관 지원 사업',
      plcySprtCn: '학생의 심리 지원을 포함한 교육과정 개발',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'mental-health',
      plcyNm: '26년 정신건강 심리상담 바우처사업',
      sprtTrgtMinAge: '0',
      sprtTrgtMaxAge: '0',
      plcySprtCn: '정신건강 심리상담 서비스 지원',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'mental-health-duplicate',
      plcyNm: '심리상담 바우처 사업(구 전국민 마음투자 지원사업)',
      sprtTrgtMinAge: '0',
      sprtTrgtMaxAge: '0',
      plcySprtCn: '마음건강 심리상담 서비스 지원',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'care-leaver',
      plcyNm: '자립준비청년 자립지원 사업',
      plcySprtCn: '자립준비청년의 안정적 사회정착 지원',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'military',
      plcyNm: '병역의무자 마음건강 관리 지원',
      addAplyQlfcCndCn: '특화분야: 병역의무자',
      plcySprtCn: '정신건강 전문가 상담 지원',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'immigrant',
      plcyNm: '이주배경청년 지원',
      plcySprtCn: '이주배경청년 진로역량 강화와 심리정서 지원',
      aplyYmd: '20260701 ~ 20261231',
    },
    {
      plcyNo: 'single-household',
      plcyNm: '청년 1인가구 사회적관계망 형성지원',
      plcySprtCn: '청년 1인가구의 고독·고립 예방과 사회적 관계망 지원',
      aplyYmd: '20260701 ~ 20261231',
    },
  ], '2026-07-29');

  assert.deepEqual(
    new Set(selected.map((item) => item.id)),
    new Set(['mental-health', 'single-household']),
  );
  const mentalHealth = selected.find((item) => item.id === 'mental-health');
  assert.ok(mentalHealth);
  assert.match(mentalHealth.eligibility, /연령 제한 없음/u);
  assert.doesNotMatch(mentalHealth.eligibility, /만 0~0세/u);
});

test('청년콘텐츠 시스템 알림을 제외하고 공식 게시물 URL을 만든다', () => {
  const content = youthContentFrom({
    bbsSn: '1',
    pstSn: '222',
    pstSeSn: '3',
    pstSeNm: '청년소식',
    pstTtl: '청년 참여 프로그램 모집',
    frstRegDt: '20260729123000',
  });
  assert.ok(content);
  assert.equal(
    content.sourceUrl,
    'https://www.youthcenter.go.kr/bbs01View/1/222/3',
  );

  const selected = selectYouthContents([
    {
      bbsSn: '1',
      pstSn: '1',
      pstSeNm: '알림',
      pstTtl: '시스템 점검 정상화 알림',
    },
    {
      bbsSn: '1',
      pstSn: '2',
      pstSeNm: '청년소식',
      pstTtl: '청년 참여 프로그램 모집',
      frstRegDt: '20260729',
    },
  ]);
  assert.deepEqual(selected.map((item) => item.id), ['1-2']);
});

test('청년센터는 대구만 남기고 북구를 우선하며 안전한 링크만 허용한다', () => {
  const unsafeCenter = youthCenterFrom({
    cntrSn: '2',
    cntrNm: '대구 중구 청년센터',
    stdgCtpvCd: '27',
    stdgSggCdNm: '중구',
    cntrUrlAddr: 'javascript:alert(1)',
  });
  assert.ok(unsafeCenter);
  assert.equal(
    unsafeCenter.sourceUrl,
    'https://www.youthcenter.go.kr/youthApply/ythCenter/ythCenterMain',
  );

  const selected = selectYouthCenters([
    {
      cntrSn: '1',
      cntrNm: '서울 청년센터',
      stdgCtpvCd: '11',
      stdgSggCdNm: '중구',
    },
    {
      cntrSn: '2',
      cntrNm: '대구 중구 청년센터',
      stdgCtpvCd: '27',
      stdgSggCdNm: '중구',
    },
    {
      cntrSn: '3',
      cntrNm: '대구 북구 청년센터',
      stdgCtpvCd: '27',
      stdgSggCdNm: '북구',
    },
  ]);
  assert.deepEqual(selected.map((item) => item.id), ['3', '2']);
});

test('한국 전화번호 형식이 맞는 연락처만 정규화해 표시한다', () => {
  assert.equal(normalizeKoreanPhone('053-123-4567'), '053-123-4567');
  assert.equal(normalizeKoreanPhone('02 1234 5678'), '02-1234-5678');
  assert.equal(normalizeKoreanPhone('01012345678'), '010-1234-5678');
  assert.equal(normalizeKoreanPhone('053-6432-0312'), '');

  const center = youthCenterFrom({
    cntrSn: 'invalid-phone',
    cntrNm: '달성군청년혁신센터',
    stdgCtpvCd: '27',
    stdgSggCdNm: '달성군',
    cntrTelno: '053-6432-0312',
  });
  assert.ok(center);
  assert.equal(center.phone, '');
});

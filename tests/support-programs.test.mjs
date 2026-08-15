import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSupportProgramSummary,
  cleanHtmlText,
  extractApplicationEndDate,
  extractYouthFoundationDetail,
  getSupportProgramSummaryEndDate,
  isSupportProgramSummaryExpired,
  parseYouthCenterResponse,
  parseYouthFoundationBoard,
} from '../src/lib/supportPrograms.ts';

const NOW = new Date('2026-08-15T03:00:00.000Z');

test('온통청년 검색 결과에서 모집 중인 고립은둔 지원정보만 정규화한다', () => {
  const programs = parseYouthCenterResponse({
    searchResult: {
      youthpolicy: [
        {
          DOCID: 'policy-1',
          PLCY_NM: '<span class="highlight">고립</span>·은둔 청년 지원 &amp; 회복',
          PLCY_EXPLN_CN: '일상회복과 사회 재진입을 지원합니다.',
          PLCY_SPRT_CN: '상담과 일경험을 제공합니다.',
          APLY_PRD_SE_CD: '진행중',
          APLY_PRD_BGNG_YMD: '20260801',
          APLY_PRD_END_YMD: '20260930',
          OPER_INST_CD_NM: '청년미래센터',
          LAST_MDFCN_DT: '2026-08-10 12:00:00',
        },
        {
          DOCID: 'expired',
          PLCY_NM: '고립청년 지원사업',
          PLCY_EXPLN_CN: '회복 지원',
          APLY_PRD_SE_CD: '진행중',
          APLY_PRD_BGNG_YMD: '20260701',
          APLY_PRD_END_YMD: '20260731',
        },
        {
          DOCID: 'unrelated',
          PLCY_NM: '청년 월세 지원',
          PLCY_EXPLN_CN: '월세를 지원합니다.',
          APLY_PRD_SE_CD: '진행중',
          APLY_PRD_END_YMD: '20261231',
        },
      ],
    },
  }, NOW);

  assert.equal(programs.length, 1);
  assert.equal(programs[0].title, '고립·은둔 청년 지원 & 회복');
  assert.equal(programs[0].source, '온통청년 · 청년미래센터');
  assert.equal(programs[0].applicationPeriod, '신청기간: 2026.08.01 ~ 2026.09.30');
  assert.match(programs[0].url, /policy-1$/u);
});

test('청년재단 목록에서 청년 당사자 모집 공고만 남기고 마감 공고를 제외한다', () => {
  const html = `
    <a href="javascript:void(0);" onclick="javascript:fn_detail('1001');">
      <p class="subject">2026 고립·은둔 경험청년 참여자 모집 (~9/30)</p>
      <span class="field_name">작성일</span><span class="field_cont">2026.08.10</span>
    </a>
    <a href="javascript:void(0);" onclick="javascript:fn_detail('1002');">
      <p class="subject">2026 고립청년 지원조직 종사자 모집 (~9/30)</p>
      <span class="field_name">작성일</span><span class="field_cont">2026.08.10</span>
    </a>
    <a href="javascript:void(0);" onclick="javascript:fn_detail('1003');">
      <p class="subject">2026 고립청년 참여자 모집 (~7/31)</p>
      <span class="field_name">작성일</span><span class="field_cont">2026.07.20</span>
    </a>
  `;

  const items = parseYouthFoundationBoard(html, { now: NOW, lookbackDays: 90 });
  assert.deepEqual(items.map((item) => item.id), ['1001']);
  assert.equal(items[0].applicationEndDate, '2026-09-30');
});

test('청년재단 상세 본문과 여러 형식의 신청 마감일을 추출한다', () => {
  const html = `
    <div class="bo_v"><div class="cont">
      <p>고립 경험 청년에게 직무교육과 일경험을 제공합니다.</p>
      <p><strong>참여신청</strong>: 26.8.10(월) ~ 26.9.3(목)</p>
    </div></div><div class="btngroup">목록</div>
  `;
  const detail = extractYouthFoundationDetail(html);

  assert.match(detail, /직무교육과 일경험/u);
  assert.equal(extractApplicationEndDate(detail, '2026-08-10'), '2026-09-03');
});

test('지원정보 요약의 마감일을 읽어 자동선별 시 만료 여부를 판단한다', () => {
  const summary = buildSupportProgramSummary({
    id: 'test',
    title: '고립청년 회복 프로그램',
    url: 'https://example.com/program',
    source: '온통청년',
    description: '회복 프로그램입니다.',
    publishedAt: '2026-08-01',
    applicationPeriod: '신청기간: 2026.08.01 ~ 2026.08.14',
    applicationEndDate: '2026-08-14',
  });

  assert.equal(getSupportProgramSummaryEndDate(summary), '2026-08-14');
  assert.equal(isSupportProgramSummaryExpired(summary, NOW), true);
});

test('공식 사이트 HTML 태그와 엔티티를 안전한 일반 텍스트로 바꾼다', () => {
  assert.equal(
    cleanHtmlText('<span class="highlight">고립</span>&nbsp;&amp;&nbsp;은둔<br>지원'),
    '고립 & 은둔\n지원',
  );
});

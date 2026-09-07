import assert from 'node:assert/strict';
import test from 'node:test';
import { collectSources, parseNkisList, parseNkisDetail, parseLawList, decodeNkisBody } from '../src/lib/research/collectors.ts';
import { sourceRecord, sourceScope, parseSourceReview, sourceEvidence } from '../src/lib/research/source-core.ts';

const record = (id = 'R01') => `<OTP_ID>${id}</OTP_ID><OTP_SEQ>0</OTP_SEQ><OTP_HAN_NM>고립·은둔 청년 지원 연구</OTP_HAN_NM><PUBAGC>한국청소년정책연구원</PUBAGC><PBL_YY>2025</PBL_YY>`;
const list = `<root><TOTAL_COUNT>1</TOTAL_COUNT><results><result>${record()}</result></results></root>`;
const detail = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><root><result>' + record() + '<HAN_ABS><![CDATA[<p>지원체계 검토</p>]]></HAN_ABS></result></root>';
const law = { 법령일련번호: '270215', 법령명한글: '가족돌봄 등 위기아동ㆍ청년 지원에 관한 법률', 소관부처명: '보건복지부', 공포일자: '20250325', 시행일자: '20260326', 법령상세링크: 'https://law.go.kr/a?OC=secret' };

test('NKIS의 EUC-KR 목록과 HTML DOCTYPE이 포함된 상세 XML을 처리한다', () => {
  assert.equal(decodeNkisBody(Uint8Array.from([0xb0, 0xed, 0xb8, 0xb3]).buffer, 'text/xml;charset=EUC-KR'), '고립');
  const item = parseNkisList(list, 'report').records[0];
  assert.equal(item.year, 2025);
  assert.equal(parseNkisDetail(detail, item).excerpt, '지원체계 검토');
  assert.throws(() => parseNkisDetail(detail.replace('R01', 'R02'), item), /mismatch/);
});

test('API 오류·HTML 장애·미확인 응답을 자료 0건으로 숨기지 않는다', () => {
  for (const xml of ['<html><body>failed</body></html>', '<root><RESULT_CODE>30</RESULT_CODE></root>', '<root/>', '<root><TOTAL_COUNT>1</TOTAL_COUNT></root>', '<!DOCTYPE root [<!ENTITY s "secret">]><root/>']) assert.throws(() => parseNkisList(xml, 'report'));
  assert.equal(parseNkisList('<root><TOTAL_COUNT>0</TOTAL_COUNT><results/></root>', 'report').records.length, 0);
  assert.throws(() => parseLawList({ result: 'error', msg: 'secret key rejected' }));
});

test('법령의 원문 링크에서 인증정보를 제거하고 공포일·시행일을 분리한다', () => {
  const result = parseLawList({ LawSearch: { totalCnt: 2, law: [law, { ...law, 법령명한글: '위기 임신 및 보호출산 지원과 아동 보호에 관한 특별법' }] } });
  assert.equal(result.records.length, 1);
  const row = result.records[0];
  assert.equal(row.published_at, '2025-03-25'); assert.equal(row.effective_at, '2026-03-26');
  assert.equal(row.publication_year, 2025); assert.doesNotMatch(row.url, /OC|secret/);
  assert.equal(parseLawList({ LawSearch: { totalCnt: 1, law } }).records.length, 1);
});

test('청년 대상과 전 연령 배경자료를 구분하고 무관한 검색 결과를 제외한다', () => {
  assert.equal(sourceScope('고립·은둔형 청소년 실태'), 'youth');
  assert.equal(sourceScope('생애주기별 사회적 고립 및 외로움 실태'), 'all_ages');
  assert.equal(sourceScope('가족돌봄청년지원정책 관련법령'), 'youth');
  assert.equal(sourceScope('주택의 지역사회 고립 및 공간환경 개선'), null);
  assert.equal(sourceScope('청년 주식투자 가이드'), null);
});

test('검색어·조회 시간 변경은 검토 버전을 바꾸지 않고 초록 변경만 재검토를 유발한다', () => {
  const a = parseLawList({ LawSearch: { totalCnt: 1, law } }).records[0];
  const { id, content_hash, checked_at, ...input } = a;
  const b = sourceRecord({ ...input, keywords: ['다른 검색어'] }, new Date('2027-01-01'));
  assert.equal(b.id, id); assert.equal(b.content_hash, content_hash); assert.notEqual(b.checked_at, checked_at);
  assert.notEqual(sourceRecord({ ...input, raw_excerpt: '개정된 자료' }).content_hash, content_hash);
});

test('검토 승인에 필요한 필드를 강제하고 공공 응답에는 원시 초록을 포함하지 않는다', () => {
  const row = { ...parseLawList({ LawSearch: { totalCnt: 1, law } }).records[0], review_status: 'approved', summary: '요약', application: '검토 방향', limitation: '목록만 확인', review_scope: 'API 메타데이터', topics: ['policy'], reviewed_at: '2026-09-07T00:00:00Z' };
  assert.equal(parseSourceReview(row).review_status, 'approved');
  assert.throws(() => parseSourceReview({ ...row, limitation: '' }));
  assert.throws(() => parseSourceReview({ ...row, topics: [] }));
  assert.throws(() => parseSourceReview({ ...row, content_hash: 'x&select=*' }));
  assert.equal('raw_excerpt' in sourceEvidence(row), false);
  assert.equal(sourceEvidence(row).reviewedAt, '2026-09-07');
});

test('수집은 중복 검색 결과를 통합하고 상세 실패를 성공으로 저장하지 않는다', async () => {
  const previous = process.env.NKIS_API_KEY;
  process.env.NKIS_API_KEY = 'fixture-secret';
  try {
    const result = await collectSources('nkis', { keywords: ['고립', '은둔'], fetcher: async url => {
      const text = url.pathname.includes('Research') ? '<root><TOTAL_COUNT>0</TOTAL_COUNT><results/></root>' : url.pathname.includes('Detail') ? detail : list;
      return new Response(text, { headers: { 'Content-Type': 'text/xml;charset=UTF-8' } });
    } });
    assert.equal(result.records.length, 1); assert.equal(result.requests, 5);
    assert.deepEqual(result.records[0].keywords, ['고립', '은둔']);
    assert.doesNotMatch(JSON.stringify(result), /fixture-secret/);
    await assert.rejects(collectSources('nkis', { keywords: ['고립'], fetcher: async url => new Response(url.pathname.includes('Detail') ? 'failed' : list, { status: url.pathname.includes('Detail') ? 503 : 200 }) }), /all_details_failed/);
  } finally { if (previous === undefined) delete process.env.NKIS_API_KEY; else process.env.NKIS_API_KEY = previous; }
});

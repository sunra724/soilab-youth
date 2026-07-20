import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterPublicExperiments,
  filterPublicKpis,
  filterPublicProblems,
  livingLabData,
  publicExperiments,
  publicKpis,
  publicProblems,
} from '../src/data/livinglab.ts';

test('미승인 KPI와 null 값은 공개 목록에서 제외한다', () => {
  assert.equal(publicKpis.length, 0);
  assert.ok(livingLabData.kpis.every((item) => item.value === null));

  const approvedZero = {
    ...livingLabData.kpis[0],
    id: 'approved-zero',
    value: 0,
    status: 'approved',
  };
  const approvedNull = {
    ...livingLabData.kpis[0],
    id: 'approved-null',
    value: null,
    status: 'approved',
  };

  assert.deepEqual(filterPublicKpis([approvedZero, approvedNull]), [approvedZero]);
});

test('문제은행은 승인된 구조적 장벽 8건만 공개한다', () => {
  assert.equal(publicProblems.length, 8);
  assert.ok(publicProblems.every((problem) => problem.status === 'approved'));

  const draft = { ...publicProblems[0], id: 'draft-problem', status: 'draft' };
  assert.equal(filterPublicProblems([...publicProblems, draft]).length, 8);
});

test('실증사례는 공개 승인 전까지 노출하지 않는다', () => {
  assert.equal(livingLabData.experiments.length, 3);
  assert.equal(publicExperiments.length, 0);
  assert.equal(filterPublicExperiments(livingLabData.experiments).length, 0);
});

test('패키지 문의 코드는 중복되지 않는다', () => {
  const codes = livingLabData.packages.map((item) => item.inquiryCode);
  assert.equal(new Set(codes).size, codes.length);
});

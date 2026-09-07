import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { prepareStatistics } from '../src/lib/research/statistics-core.ts';

function preview() {
  const relation = (id, ages, items) => ({ tblId: id, rows: ['00', '22'].flatMap(region => (region === '22' ? ['000'] : ['000', ...ages]).flatMap(age => items.map(item => ({ ORG_ID: '101', TBL_ID: id, PRD_DE: '2025', C1: region, C2: age, ITM_ID: item, DT: '19.651', UNIT_NM: '%', LST_CHN_DE: '2025-11-07' })))) });
  return { fetchedAt: '2026-09-07T03:00:00Z', period: '2025', tables: [
    relation('DT_1SSSP041R', ['1929', '3039'], ['T12', 'T32']),
    relation('DT_1SSSP050R', ['2029', '3039'], ['T20', 'T30']),
    { tblId: 'DT_417001_0035', rows: ['10', '4001', '4002'].flatMap(age => ['A', 'C'].map(item => ({ ORG_ID: '417', TBL_ID: 'DT_417001_0035', PRD_DE: '2025', C1: age, C2: item, C3: '05', ITM_ID: 'T1', DT: '1.6', UNIT_NM: '점', LST_CHN_DE: '2026-03-03' }))) },
  ] };
}

test('청년 연령·전체 모집단·평균과 비율을 구분하며 미제공 대구 청년 값을 만들지 않는다', () => {
  const result = prepareStatistics(preview());
  assert.equal(result.tables.flatMap(table => table.rows).length, 22);
  assert.equal(result.tables[0].rows[0].population, '전체 · 19세 이상');
  assert.equal(result.tables[0].rows[1].population, '전체 · 13세 이상');
  assert.ok(result.tables[0].rows.some(row => row.population === '19~29세'));
  assert.ok(result.tables[1].rows.some(row => row.population === '20~29세'));
  assert.ok(result.tables.flatMap(table => table.rows).filter(row => row.region === '대구').every(row => row.population.startsWith('전체')));
  assert.ok(result.tables[2].rows.every(row => row.unit === '점' && row.region === '전국'));
  assert.equal(result.checkedAt, '');
});

test('조회 오류, 단위·분류·기간 변화, 누락과 중복 셀은 발행 후보 생성 전에 거부한다', () => {
  for (const mutate of [p => { p.tables[0].error = 'failed'; }, p => { p.tables[0].rows.pop(); }, p => { p.tables[0].rows[1] = p.tables[0].rows[0]; }, p => { p.tables[0].rows[0].PRD_DE = '2023'; }, p => { p.tables[0].rows[0].UNIT_NM = '점'; }, p => { p.tables[2].rows[0].C3 = '01'; }, p => { p.tables[2].rows[0].ITM_ID = 'T2'; }, p => { p.tables[2].rows[0].DT = '32'; }, p => { p.tables[0].rows[0].DT = '-'; }]) {
    const p = preview(); mutate(p); assert.throws(() => prepareStatistics(p));
  }
});

test('원문 정밀도·RSE 기호를 보존하고 비밀 키와 조회 매개변수는 공개 후보에서 제거한다', () => {
  const p = preview(); p.tables[0].rows[0].DT = '19.651**'; p.tables[0].query = { apiKey: 'private-example-key' };
  const result = prepareStatistics(p);
  assert.equal(result.tables[0].rows[0].value, '19.651**');
  assert.equal(JSON.stringify(result).includes('private-example-key'), false);
});

test('검토한 공개본은 2025년 22개 원문 값과 KOSIS 출처·확인일을 갖는다', () => {
  const data = JSON.parse(readFileSync(new URL('../src/data/research-statistics.json', import.meta.url), 'utf8'));
  assert.equal(data.period, '2025'); assert.equal(data.checkedAt, '2026-09-07');
  assert.equal(data.tables.flatMap(table => table.rows).length, 22);
  assert.ok(data.tables.every(table => new URL(table.url).hostname === 'kosis.kr'));
  assert.equal(data.tables[0].rows.find(row => row.region === '전국' && row.population === '19~29세' && row.metric.includes('집안일')).value, '19.651');
  assert.equal(data.tables[2].rows.find(row => row.population === '30~39세' && row.metric.includes('아무도')).value, '1.6');
});

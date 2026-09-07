type RawRow = { ORG_ID: string; TBL_ID: string; PRD_DE: string; C1: string; C2: string; C3?: string; ITM_ID: string; DT: string; UNIT_NM: string; LST_CHN_DE: string };
type Preview = { fetchedAt: string; period: string; tables: { tblId: string; rows?: RawRow[]; error?: string }[] };
export type StatisticRow = { region: string; population: string; metric: string; value: string; unit: string; updatedAt: string };
export type StatisticTable = { id: string; title: string; survey: string; url: string; note: string; rows: StatisticRow[] };
export type StatisticsSnapshot = { period: string; checkedAt: string; fetchedAt: string; tables: StatisticTable[] };

const definitions = [
  {
    id: 'DT_1SSSP041R', org: '101', title: '사회적 관계망', survey: '사회조사', unit: '%',
    note: '집안일 도움 문항은 19세 이상, 이야기 상대 문항은 13세 이상입니다. 전국 연령대별 값과 전체 연령 값의 모집단을 구분해 읽습니다. 서로 다른 문항의 비율을 더해 고립률을 만들지 않습니다.',
    ages: { '000': '전체', '1929': '19~29세', '3039': '30~39세' },
    metrics: { T12: '몸이 아파 집안일을 부탁할 사람이 없음', T32: '낙심하거나 우울해서 이야기할 상대가 없음' },
  },
  {
    id: 'DT_1SSSP050R', org: '101', title: '외로움', survey: '사회조사', unit: '%',
    note: '13세 이상 인구의 외로움 응답입니다. 전국 연령 구간은 20~29세·30~39세로 관계망 표와 다릅니다. 이번 확인 범위는 2025년이며, 이전 연도 추세를 이 표에서 추정하지 않습니다.',
    ages: { '000': '전체', '2029': '20~29세', '3039': '30~39세' },
    metrics: { T20: '외로움을 자주 느낌', T30: '외로움을 가끔 느낌' },
  },
  {
    id: 'DT_417001_0035', org: '417', title: '사회적 고립감', survey: '사회통합실태조사', unit: '점',
    note: '19세 이상 인구의 문항별 평균입니다. 1~4점 척도이며 높을수록 해당 느낌이 큽니다. 인구 비율이나 진단 기준이 아니며, 두 문항을 합산한 점수가 아닙니다. 이 통계표에는 대구 지역 구분이 없습니다.',
    ages: { '10': '전체 · 19세 이상', '4001': '19~29세', '4002': '30~39세' },
    metrics: { A: '외롭다고 느끼는 정도', C: '아무도 자신을 잘 알지 못한다고 느끼는 정도' },
  },
] as const;

// Only a local candidate is generated. An editor reviews the source notes before publication.
export function prepareStatistics(preview: Preview): StatisticsSnapshot {
  if (!/^\d{4}$/.test(preview.period) || !Number.isFinite(Date.parse(preview.fetchedAt))) throw new Error('Invalid statistics period');
  const tables = definitions.map(def => {
    const source = preview.tables.find(table => table.tblId === def.id);
    if (!source?.rows?.length || source.error) throw new Error(`Missing table: ${def.id}`);
    if (source.rows.length !== (def.org === '417' ? 6 : 8)) throw new Error('Changed cell coverage needs review');
    const seen = new Set<string>();
    const rows = source.rows.map(row => {
      if (row.ORG_ID !== def.org || row.TBL_ID !== def.id || row.PRD_DE !== preview.period || row.UNIT_NM !== def.unit || !/^\d{4}-\d{2}-\d{2}$/.test(row.LST_CHN_DE)) throw new Error('Unexpected source metadata');
      const mean = def.org === '417';
      const ageCode = mean ? row.C1 : row.C2;
      const metricCode = mean ? row.C2 : row.ITM_ID;
      const age = (def.ages as Record<string, string>)[ageCode];
      const metric = (def.metrics as Record<string, string>)[metricCode];
      const region = mean || row.C1 === '00' ? '전국' : row.C1 === '22' ? '대구' : undefined;
      if (!age || !metric || !region || (mean && (row.C3 !== '05' || row.ITM_ID !== 'T1')) || (region === '대구' && ageCode !== '000')) throw new Error('Unexpected source dimension');
      const key = `${region}/${ageCode}/${metricCode}`;
      if (seen.has(key)) throw new Error('Duplicate statistics cell');
      seen.add(key);
      // Preserve published precision and reliability symbols; never coerce absent values to zero.
      if (!/^\d+(?:\.\d+)?(?:\*{1,2})?$/.test(row.DT)) throw new Error('Non-numeric cell needs review');
      const value = Number(row.DT.replace(/\*/g, ''));
      if (value < (mean ? 1 : 0) || value > (mean ? 4 : 100)) throw new Error('Value outside source scale');
      const population = age !== '전체' ? age : def.id === 'DT_1SSSP041R' && metricCode === 'T12' ? '전체 · 19세 이상' : '전체 · 13세 이상';
      return { region, population, metric, value: row.DT, unit: def.unit, updatedAt: row.LST_CHN_DE };
    });
    return { id: def.id, title: def.title, survey: def.survey, url: `https://kosis.kr/statHtml/statHtml.do?orgId=${def.org}&tblId=${def.id}`, note: def.note, rows };
  });
  return { period: preview.period, checkedAt: '', fetchedAt: preview.fetchedAt, tables };
}

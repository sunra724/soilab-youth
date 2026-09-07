import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read-only preparation: local report only; no database, publication or messaging.
const root = resolve(import.meta.dirname, '..');
if (existsSync(resolve(root, '.env.local'))) process.loadEnvFile(resolve(root, '.env.local'));
const apiKey = process.env.KOSIS_API_KEY;
if (!apiKey) {
  console.error('KOSIS_API_KEY is required in the app .env.local or process environment.');
  process.exit(1);
}
const config = JSON.parse(readFileSync(resolve(root, 'docs/research/kosis-candidates.json'), 'utf8'));
const output = resolve(root, '.local/research/kosis');
mkdirSync(output, { recursive: true });

async function getRows(endpoint, params) {
  const url = new URL(endpoint, 'https://kosis.kr/openapi/');
  for (const [key, value] of Object.entries({ ...params, apiKey, format: 'json', jsonVD: 'Y' })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('upstream_http_error');
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) throw new Error('upstream_empty_or_error');
  return rows;
}

const report = { fetchedAt: new Date().toISOString(), period: config.period, status: 'preview-only', tables: [] };
for (const table of config.tables) {
  try {
    const identity = { orgId: table.orgId, tblId: table.tblId };
    const query = { method: 'getList', ...identity, ...table.query, startPrdDe: config.period, endPrdDe: config.period, smblChk: 'Y' };
    const jobs = [
      getRows('Param/statisticsParameterData.do', query),
      ...['ITM', 'PRD', 'CMMT'].map(type => getRows('statisticsData.do', { method: 'getMeta', ...identity, type })),
    ];
    const results = await Promise.allSettled(jobs);
    if (results.some(result => result.status === 'rejected')) throw new Error('upstream_request_failed');
    const [rows, items, periods, comments] = results.map(result => result.value);
    if (rows.length < table.minimumObservedRows || rows.some(row => row.PRD_DE !== config.period || row.TBL_ID !== table.tblId || row.ORG_ID !== table.orgId || typeof row.DT !== 'string' || !row.UNIT_NM)) {
      throw new Error('unexpected_data_shape');
    }
    // Keep original DT strings and symbols. Missing region/age cells are not zero.
    const missingDaeguCells = table.daeguCode ? table.nationalAgeCodes.flatMap(age =>
      table.query.itmId.split('+').filter(item => !rows.some(row => row.C1 === table.daeguCode && row.C2 === age && row.ITM_ID === item))
        .map(item => ({ region: table.daeguCode, age, item }))
    ) : [];
    report.tables.push({ ...identity, name: table.name, url: table.url, query, rows, metadata: { items, periods, comments }, missingDaeguCells });
    console.log(JSON.stringify({ table: table.tblId, rows: rows.length, missingDaeguCells: missingDaeguCells.length, status: 'preview-only' }));
  } catch {
    // Fetch errors may contain the secret-bearing URL; never print them.
    report.tables.push({ tblId: table.tblId, error: 'kosis_preview_failed' });
    console.error(JSON.stringify({ table: table.tblId, error: 'kosis_preview_failed' }));
    process.exitCode = 1;
  }
}
writeFileSync(resolve(output, 'preview.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

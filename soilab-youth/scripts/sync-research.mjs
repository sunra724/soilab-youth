import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { collectSources } from '../src/lib/research/collectors.ts';
import { runSourceSync } from '../src/lib/research/source-store.ts';

const root = resolve(import.meta.dirname, '..');
if (existsSync(resolve(root, '.env.local'))) process.loadEnvFile(resolve(root, '.env.local'));
const args = process.argv.slice(2);
const provider = args.find(a => a.startsWith('--provider='))?.split('=')[1] || 'all';
if (!['all', 'nkis', 'law'].includes(provider)) throw new Error('Use --provider=nkis|law|all');
let failed = false;
for (const source of provider === 'all' ? ['nkis', 'law'] : [provider]) {
  try {
    if (args.includes('--write')) {
      console.log(JSON.stringify(await runSourceSync(source)));
      continue;
    }
    const result = await collectSources(source);
    if (args.includes('--report')) {
      const directory = resolve(root, '.local/research');
      mkdirSync(directory, { recursive: true });
      writeFileSync(resolve(directory, `${source}-candidates.json`), JSON.stringify(result, null, 2), 'utf8');
      const lines = ['# 청년 정책자료 수집 검토 목록', '', `수집일: ${new Date().toISOString()}`, `수집원: ${source} · 후보 ${result.records.length}건 · 공개 전 검토 필요`, '',
        '목록·초록 및 법령 메타데이터를 조회했습니다. 보고서 전문 또는 조문 전체의 검토 결과가 아닙니다.', '',
        ...result.records.flatMap(row => [`## ${row.title}`, '', `- 기관: ${row.publisher}`, `- 발행연도: ${row.publication_year || '미확인'}`, `- 대상: ${row.scope === 'youth' ? '아동·청소년·청년 (세부 연령 확인 필요)' : '전 연령·제도 배경'}`, `- 공포일: ${row.published_at || '미확인'} / 시행일: ${row.effective_at || '해당 없음 또는 미확인'}`, `- 원문: ${row.url}`, '', row.raw_excerpt || '초록 미제공. 원문 확인 필요.', '']),
      ];
      writeFileSync(resolve(directory, `${source}-candidates.md`), lines.join('\n'), 'utf8');
    }
    console.log(JSON.stringify({ provider: source, records: result.records.length, requests: result.requests, failures: result.failures, detailFailures: result.detailFailures, truncated: result.truncated, preview: result.records.slice(0, 10).map(r => ({ title: r.title, publisher: r.publisher, year: r.publication_year, scope: r.scope })), mode: 'dry-run' }));
    if (result.failures.length || result.detailFailures || result.truncated.length) failed = true;
  } catch (error) {
    // Never log upstream URLs/errors: they can contain API credentials.
    console.error(JSON.stringify({ provider: source, error: /^\w+$/.test(error.message) ? error.message : 'collection_failed' }));
    failed = true;
  }
}
if (failed) process.exitCode = 1;

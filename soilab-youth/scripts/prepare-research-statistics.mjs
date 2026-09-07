import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { prepareStatistics } from '../src/lib/research/statistics-core.ts';

const root = resolve(import.meta.dirname, '..');
const preview = JSON.parse(readFileSync(resolve(root, '.local/research/kosis/preview.json'), 'utf8'));
const candidate = prepareStatistics(preview);
writeFileSync(resolve(root, '.local/research/kosis/publication-candidate.json'), JSON.stringify(candidate, null, 2) + '\n');
console.log(`Prepared ${candidate.tables.length} tables / ${candidate.tables.reduce((sum, table) => sum + table.rows.length, 0)} rows. Review and set checkedAt before copying to src/data/research-statistics.json.`);

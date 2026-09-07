import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

const root = resolve(import.meta.dirname, '..');
const target = resolve(root, '.env.local');
const youth = parseEnv(readFileSync(resolve(root, '../.env.local'), 'utf8'));
const care = parseEnv(readFileSync(resolve(root, '../../soilab-care/soilab-care-web/.env.local'), 'utf8'));
let content = existsSync(target) ? readFileSync(target, 'utf8') : '';
const current = parseEnv(content);
const additions = {};
for (const key of ['NKIS_API_KEY', 'LAW_GO_KR_OC', 'KOSIS_API_KEY']) if (!current[key] && care[key]) additions[key] = care[key];
for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY', 'YOUTH_BRIEFING_BOT_TOKEN', 'YOUTH_BRIEFING_CHAT_ID', 'YOUTH_BRIEFING_CHANNEL_URL']) {
  if (!current[key] && youth[key]) additions[key] = youth[key];
}
for (const key of ['YOUTH_RESEARCH_REVIEW_TOKEN', 'CRON_SECRET']) {
  if (!current[key]) additions[key] = youth[key] || randomBytes(32).toString('hex');
}
const ingest = current.BRIEFING_INGEST_TOKEN || current.YOUTH_BRIEFING_INGEST_TOKEN
  || youth.BRIEFING_INGEST_TOKEN || youth.YOUTH_BRIEFING_INGEST_TOKEN || randomBytes(32).toString('hex');
if (!current.BRIEFING_INGEST_TOKEN) additions.BRIEFING_INGEST_TOKEN = ingest;
if (!current.YOUTH_BRIEFING_INGEST_TOKEN) additions.YOUTH_BRIEFING_INGEST_TOKEN = ingest;
// Carry over the service's registered API configuration, independently of the youth site's canonical URL.
if (!current.LAW_GO_KR_REFERER) additions.LAW_GO_KR_REFERER = care.LAW_GO_KR_REFERER || 'https://care.soilabcoop.kr/';
if (Object.keys(additions).length) {
  content += '\n# Youth research collection (server only)\n' + Object.entries(additions).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n';
  writeFileSync(target, content, 'utf8');
}
console.log(JSON.stringify({ configured: Object.keys(additions), secrets: 'not displayed' }));

import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { briefingHistory, briefingProperties, prepareDailyDraft, prepareQualityDraft } from '../src/lib/research/daily.ts';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const props = briefingProperties({ preview: true });
const api = process.argv.find(arg => arg.startsWith('--api='))?.slice(6);
try {
  let history = { titles: [], items: [] };
  if (props.ingest && (!api || api === props.api)) {
    history = await briefingHistory(props, fetch);
  }
  if (api) props.api = api;
  const { briefing: result, audit } = await prepareQualityDraft(props, history.titles, {
    now: () => new Date(), fetcher: fetch, draft: prepareDailyDraft, history: history.items,
  });
  mkdirSync('.local/research', { recursive: true });
  writeFileSync('.local/research/briefing-preview.txt', result.body_text, 'utf8');
  writeFileSync('.local/research/briefing-preview.json', JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify({ preview: true, stored: false, sent: false, sources: result.sources.length, model: result.generator_model,
    collectionFailures: audit.collection_failures, sourceChecks: audit.source_checks.map(check => check.reason),
    editorialChecks: audit.editorial_checks.map(check => check.reason), characters: result.body_text.length }));
  if (audit.editorial_checks.length && !result.sources.length) process.exitCode = 1;
} catch (error) { console.error('Briefing preview failed: ' + (/^[a-z_0-9]+$/.test(error.message) ? error.message : 'invalid_draft') + '. No message sent.'); process.exitCode = 1; }

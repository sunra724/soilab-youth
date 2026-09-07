import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { briefingProperties, prepareDailyDraft } from '../src/lib/research/daily.ts';
const env = parseEnv(readFileSync('.env.local', 'utf8'));
for (const [name, value] of Object.entries(env)) if (!process.env[name]) process.env[name] = value;
const props = briefingProperties();
const api = process.argv.find(arg => arg.startsWith('--api='))?.slice(6);
if (api) props.api = api;
try {
  const result = await prepareDailyDraft(props, [], { now: () => new Date(), fetcher: fetch, draft: prepareDailyDraft });
  mkdirSync('.local/research', { recursive: true });
  writeFileSync('.local/research/briefing-preview.txt', result.body_text, 'utf8');
  writeFileSync('.local/research/briefing-preview.json', JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify({ preview: true, stored: false, sent: false, sources: result.sources.length, model: result.generator_model, characters: result.body_text.length }));
} catch (error) { console.error('Briefing preview failed: ' + (/^[a-z_0-9]+$/.test(error.message) ? error.message : 'invalid_draft') + '. No message sent.'); process.exitCode = 1; }

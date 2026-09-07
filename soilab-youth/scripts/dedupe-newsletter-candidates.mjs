import nextEnv from '@next/env';
import notionPackage from '@notionhq/client';
import { isSameNewsStory } from '../src/lib/newsletterDedupe.ts';

const { loadEnvConfig } = nextEnv;
const { Client } = notionPackage;

loadEnvConfig(process.cwd());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const dataSourceId = process.env.NOTION_CANDIDATES_COLLECTION;
const apply = process.argv.includes('--apply');
const since = process.argv.find((value) => value.startsWith('--since='))?.split('=')[1]
  ?? new Date(Date.now() - 60 * 24 * 60 * 60_000).toISOString().slice(0, 10);

if (!dataSourceId) {
  throw new Error('NOTION_CANDIDATES_COLLECTION is required.');
}

function fromPage(page) {
  return {
    id: page.id,
    title: page.properties['제목']?.title?.[0]?.plain_text ?? '',
    source: page.properties['출처']?.rich_text?.[0]?.plain_text ?? '',
    publishedAt: page.properties['수집일']?.date?.start ?? '',
    url: page.properties['원문링크']?.url ?? '',
  };
}

async function listCandidates() {
  const pages = [];
  let startCursor;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      filter: {
        and: [
          { property: '수집일', date: { on_or_after: since } },
          { property: '발송완료', checkbox: { equals: false } },
        ],
      },
      sorts: [{ property: '수집일', direction: 'descending' }],
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });
    pages.push(...response.results);
    startCursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (startCursor);

  return pages.map(fromPage).filter((item) => item.title && item.url);
}

const SOURCE_PRIORITY = [
  '연합뉴스',
  'KBS',
  '한겨레',
  '경향신문',
  '중앙일보',
  '뉴스1',
  '뉴시스',
  '머니투데이',
];

function representative(group) {
  return [...group].sort((left, right) => {
    const leftRank = SOURCE_PRIORITY.findIndex((source) => left.source.includes(source));
    const rightRank = SOURCE_PRIORITY.findIndex((source) => right.source.includes(source));
    const normalizedLeftRank = leftRank < 0 ? SOURCE_PRIORITY.length : leftRank;
    const normalizedRightRank = rightRank < 0 ? SOURCE_PRIORITY.length : rightRank;
    if (normalizedLeftRank !== normalizedRightRank) {
      return normalizedLeftRank - normalizedRightRank;
    }
    return right.title.length - left.title.length;
  })[0];
}

const candidates = await listCandidates();
const groups = [];
for (const candidate of candidates) {
  const group = groups.find((values) =>
    values.some((saved) => isSameNewsStory(candidate, saved))
  );
  if (group) group.push(candidate);
  else groups.push([candidate]);
}

const duplicateGroups = groups
  .filter((group) => group.length > 1)
  .map((group) => {
    const keep = representative(group);
    return {
      keep,
      archive: group.filter((item) => item.id !== keep.id),
    };
  });
const targets = duplicateGroups.flatMap((group) => group.archive);

if (apply) {
  for (const target of targets) {
    await notion.pages.update({ page_id: target.id, archived: true });
  }
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'audit',
  since,
  candidateCount: candidates.length,
  duplicateGroupCount: duplicateGroups.length,
  archivedCount: apply ? targets.length : 0,
  recoverable: true,
  groups: duplicateGroups.map((group) => ({
    keep: group.keep,
    archive: group.archive,
  })),
}, null, 2));

import nextEnv from '@next/env';
import notionPackage from '@notionhq/client';
import { assessNewsPolicy } from '../src/config/keywords.ts';
import { collapseRelatedNews } from '../src/lib/newsletterDedupe.ts';

const { loadEnvConfig } = nextEnv;
const { Client } = notionPackage;

loadEnvConfig(process.cwd());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const candidateSourceId = process.env.NOTION_CANDIDATES_COLLECTION;
const newsletterSourceId = process.env.NOTION_NEWSLETTER_COLLECTION;
const apply = process.argv.includes('--apply');
const dateArgument = process.argv.find((value) => value.startsWith('--date='));
const targetDate = dateArgument?.split('=')[1]
  ?? new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

if (!candidateSourceId || !newsletterSourceId) {
  throw new Error(
    'NOTION_CANDIDATES_COLLECTION and NOTION_NEWSLETTER_COLLECTION are required.',
  );
}

function titleProperty(properties, name) {
  return properties?.[name]?.title?.map((value) => value.plain_text ?? '').join('') ?? '';
}

function candidateFromPage(page) {
  const properties = page.properties;
  return {
    id: page.id,
    title: titleProperty(properties, '제목'),
    url: properties['원문링크']?.url ?? '',
    source: properties['출처']?.rich_text?.[0]?.plain_text ?? '',
    summary: properties['요약']?.rich_text?.[0]?.plain_text ?? '',
    publishedAt: properties['수집일']?.date?.start ?? '',
    category: properties['카테고리']?.select?.name ?? '기타',
  };
}

async function listCleanCandidates() {
  const since = new Date(`${targetDate}T00:00:00+09:00`);
  since.setDate(since.getDate() - 30);
  const response = await notion.dataSources.query({
    data_source_id: candidateSourceId,
    page_size: 100,
    filter: {
      and: [
        {
          property: '수집일',
          date: { on_or_after: since.toISOString().slice(0, 10) },
        },
        { property: '발송완료', checkbox: { equals: false } },
      ],
    },
    sorts: [{ property: '수집일', direction: 'descending' }],
  });

  const accepted = response.results
    .map(candidateFromPage)
    .filter((item) => assessNewsPolicy({
      title: item.title,
      description: item.summary,
      source: item.source,
      url: item.url,
      requirePublisher: true,
      allowReviewedSensitive: false,
    }).status === 'accepted');

  return collapseRelatedNews(accepted).slice(0, 5);
}

async function findPrivateArchive() {
  const response = await notion.dataSources.query({
    data_source_id: newsletterSourceId,
    page_size: 10,
    filter: {
      and: [
        { property: '발행일', date: { equals: targetDate } },
        { property: '공개', checkbox: { equals: false } },
      ],
    },
    sorts: [{ property: '발행호수', direction: 'descending' }],
  });

  return response.results.find(
    (page) => titleProperty(page.properties, '제목').includes('뉴스클리핑'),
  );
}

function archiveChildren(items) {
  return [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '기사 원문' } }],
      },
    },
    ...items.flatMap((item) => [
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            type: 'text',
            text: { content: item.title, link: { url: item.url } },
          }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: {
              content: [item.source, item.publishedAt].filter(Boolean).join(' · '),
            },
          }],
        },
      },
    ]),
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: {
            content: '본 클리핑은 각 언론사가 공개한 기사의 제목과 원문 링크만을 안내합니다. 기사의 저작권은 각 언론사에 있으며, 본문은 원문 링크에서 확인해 주세요.',
          },
        }],
      },
    },
  ];
}

const items = await listCleanCandidates();
const archive = await findPrivateArchive();
if (!archive) {
  throw new Error(`${targetDate}의 비공개 뉴스클리핑 아카이브를 찾지 못했습니다.`);
}
if (items.length === 0) {
  throw new Error('공개 기준을 통과한 후보가 없습니다.');
}

const existingBlocks = await notion.blocks.children.list({
  block_id: archive.id,
  page_size: 100,
});
if (existingBlocks.results.length > 0) {
  throw new Error(
    `대상 아카이브에 기존 블록 ${existingBlocks.results.length}개가 있어 자동 변경을 중단했습니다.`,
  );
}

const title = `다시봄 뉴스클리핑 ${targetDate.replace(
  /^(\d{4})-(\d{2})-(\d{2})$/u,
  '$1년 $2월 $3일',
)} (공개 정리본)`;
const summary = [
  `공개 기준으로 다시 선별한 등록 언론사 기사 ${items.length}건입니다.`,
  '당일 오전 발송본과 구성에 차이가 있을 수 있습니다.',
].join(' ');

if (apply) {
  await notion.blocks.children.append({
    block_id: archive.id,
    children: archiveChildren(items),
  });
  await notion.pages.update({
    page_id: archive.id,
    properties: {
      제목: { title: [{ text: { content: title } }] },
      요약: { rich_text: [{ text: { content: summary } }] },
      공개: { checkbox: true },
    },
  });
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'audit',
  date: targetDate,
  archiveId: archive.id,
  previousTitle: titleProperty(archive.properties, '제목'),
  newTitle: title,
  publicAfterRun: apply,
  itemCount: items.length,
  items: items.map(({ title: itemTitle, source, publishedAt, url }) => ({
    title: itemTitle,
    source,
    publishedAt,
    url,
  })),
}, null, 2));

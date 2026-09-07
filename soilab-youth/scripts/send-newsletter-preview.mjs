import nextEnv from '@next/env';
import notionPackage from '@notionhq/client';
import { Resend } from 'resend';
import { classifyNewsCategory } from '../src/config/keywords.ts';
import {
  buildEmailHtml,
  buildEmailText,
} from '../src/lib/emailTemplate.ts';
import { newsletterFrom } from '../src/lib/newsletterMailer.ts';
import {
  createOneClickUnsubscribeUrl,
  createUnsubscribeUrl,
} from '../src/lib/newsletterToken.ts';

const { loadEnvConfig } = nextEnv;
const { Client } = notionPackage;

loadEnvConfig(process.cwd());

const recipient = process.argv.find((value) => value.startsWith('--to='))?.split('=')[1]
  ?.trim()
  .toLowerCase();
const issueDate = process.argv.find((value) => value.startsWith('--date='))?.split('=')[1]
  ?? new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const send = process.argv.includes('--send');

if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(recipient)) {
  throw new Error('--to=recipient@example.com is required.');
}
if (!process.env.NOTION_TOKEN || !process.env.NOTION_NEWSLETTER_COLLECTION) {
  throw new Error('Notion newsletter configuration is required.');
}
if (!process.env.RESEND_API_KEY || !newsletterFrom()) {
  throw new Error('Resend newsletter configuration is required.');
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const resend = new Resend(process.env.RESEND_API_KEY);

function titleProperty(page) {
  return page.properties['제목']?.title?.map((value) => value.plain_text ?? '').join('') ?? '';
}

function blockText(block, type) {
  const richText = block?.[type]?.rich_text;
  return Array.isArray(richText)
    ? richText.map((value) => value.plain_text ?? '').join('')
    : '';
}

function blockLink(block, type) {
  const richText = block?.[type]?.rich_text;
  return Array.isArray(richText)
    ? richText.find((value) => value.href)?.href ?? ''
    : '';
}

async function loadIssue() {
  const response = await notion.dataSources.query({
    data_source_id: process.env.NOTION_NEWSLETTER_COLLECTION,
    page_size: 10,
    filter: {
      and: [
        { property: '발행일', date: { equals: issueDate } },
        { property: '공개', checkbox: { equals: true } },
      ],
    },
    sorts: [{ property: '발행호수', direction: 'descending' }],
  });
  const page = response.results.find((result) =>
    titleProperty(result).includes('뉴스클리핑')
  );
  if (!page) {
    throw new Error(`${issueDate} 공개 뉴스클리핑을 찾지 못했습니다.`);
  }

  const items = [];
  let pending = null;
  let startCursor;
  do {
    const blocks = await notion.blocks.children.list({
      block_id: page.id,
      page_size: 100,
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });

    for (const block of blocks.results) {
      if (!('type' in block)) continue;
      if (block.type === 'bulleted_list_item') {
        if (pending?.title && pending.url) items.push(pending);
        pending = {
          title: blockText(block, 'bulleted_list_item'),
          url: blockLink(block, 'bulleted_list_item'),
          source: '',
          publishedAt: '',
          category: '기타',
        };
      } else if (block.type === 'paragraph' && pending) {
        const [source = '', publishedAt = ''] = blockText(block, 'paragraph')
          .split(' · ');
        pending.source = source;
        pending.publishedAt = publishedAt;
        pending.category = classifyNewsCategory(pending.title);
        if (pending.title && pending.url) items.push(pending);
        pending = null;
      }
    }

    startCursor = blocks.has_more && blocks.next_cursor
      ? blocks.next_cursor
      : undefined;
  } while (startCursor);

  if (pending?.title && pending.url) items.push(pending);
  return { page, items: items.slice(0, 7) };
}

function issueLabel(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00+09:00`));
}

const issue = await loadIssue();
if (issue.items.length === 0) {
  throw new Error('공개 회차에 발송할 기사가 없습니다.');
}

const label = issueLabel(issueDate);
const subject = `[테스트] [다시봄 뉴스클리핑] ${label} - Outlook 디자인 확인`;
const archiveUrl = `https://www.soilab-youth.kr/newsletter/${issueDate}`;
const unsubscribeUrl = createUnsubscribeUrl(recipient);
const oneClickUrl = createOneClickUnsubscribeUrl(recipient);
const unsubscribeEmail = process.env.NEWSLETTER_UNSUBSCRIBE_EMAIL
  ?? 'youth-news@soilabcoop.kr';

const payload = {
  from: newsletterFrom(),
  to: recipient,
  replyTo: process.env.NEWSLETTER_REPLY_TO ?? unsubscribeEmail,
  subject,
  headers: {
    'List-Unsubscribe': `<${oneClickUrl}>, <mailto:${unsubscribeEmail}?subject=${encodeURIComponent('뉴스레터 수신거부')}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
  html: buildEmailHtml({
    issueLabel: label,
    items: issue.items,
    previewText: `[테스트] ${label} 공개 정리본 · 기사 ${issue.items.length}건`,
    unsubscribeUrl,
  }),
  text: buildEmailText({
    issueLabel: label,
    items: issue.items,
    unsubscribeUrl,
  }),
};

if (!send) {
  console.log(JSON.stringify({
    mode: 'audit',
    to: recipient,
    subject,
    archiveUrl,
    itemCount: issue.items.length,
    titles: issue.items.map((item) => item.title),
  }, null, 2));
  process.exit(0);
}

const result = await resend.emails.send(payload);
if (result.error || !result.data?.id) {
  throw new Error(`Resend send failed: ${JSON.stringify(result.error)}`);
}

let delivery = null;
for (let attempt = 0; attempt < 6; attempt += 1) {
  const response = await resend.emails.get(result.data.id);
  if (response.error) {
    throw new Error(`Resend status failed: ${JSON.stringify(response.error)}`);
  }
  delivery = response.data;
  if (
    delivery?.last_event
    && !['queued', 'sent', 'scheduled'].includes(delivery.last_event)
  ) {
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 2_000));
}

console.log(JSON.stringify({
  mode: 'sent',
  id: result.data.id,
  to: recipient,
  subject,
  archiveUrl,
  itemCount: issue.items.length,
  lastEvent: delivery?.last_event ?? 'unknown',
  createdAt: delivery?.created_at ?? '',
}, null, 2));

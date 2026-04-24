import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Client } from '@notionhq/client';
import { revalidateTag } from 'next/cache';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { buildEmailHtml, buildEmailText } from '@/lib/emailTemplate';
import { createUnsubscribeUrl } from '@/lib/newsletterToken';
import { listNewsletterRecipients } from '@/lib/resendContacts';
import {
  CANDIDATE_PROPS,
  NEWSLETTER_PROPS,
} from '@/lib/notionSchema';

interface SelectedNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  category: string;
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CANDIDATES_COLLECTION_ID = process.env.NOTION_CANDIDATES_COLLECTION!;
const NEWSLETTER_DB_ID = process.env.NOTION_NEWSLETTER_DB!;
const NEWSLETTER_COLLECTION_ID = process.env.NOTION_NEWSLETTER_COLLECTION!;

async function getSelectedItems() {
  const res = await notion.dataSources.query({
    data_source_id: CANDIDATES_COLLECTION_ID,
    filter: {
      and: [
        { property: CANDIDATE_PROPS.isSelected, checkbox: { equals: true } },
        { property: CANDIDATE_PROPS.isSent, checkbox: { equals: false } },
      ],
    },
    sorts: [{ property: CANDIDATE_PROPS.category, direction: 'ascending' }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.results.map((page: any): SelectedNewsItem => ({
    id: page.id,
    title: page.properties[CANDIDATE_PROPS.title]?.title?.[0]?.plain_text ?? '',
    url: page.properties[CANDIDATE_PROPS.url]?.url ?? '',
    source: page.properties[CANDIDATE_PROPS.source]?.rich_text?.[0]?.plain_text ?? '',
    summary: page.properties[CANDIDATE_PROPS.summary]?.rich_text?.[0]?.plain_text ?? '',
    category: page.properties[CANDIDATE_PROPS.category]?.select?.name ?? '기타',
  }));
}

async function getAutoSelectableItems(limit: number) {
  if (limit <= 0) {
    return [];
  }

  const res = await notion.dataSources.query({
    data_source_id: CANDIDATES_COLLECTION_ID,
    page_size: Math.min(limit, 25),
    filter: {
      and: [
        { property: CANDIDATE_PROPS.isSent, checkbox: { equals: false } },
        { property: CANDIDATE_PROPS.isSelected, checkbox: { equals: false } },
      ],
    },
    sorts: [{ property: CANDIDATE_PROPS.collectedAt, direction: 'descending' }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.results.map((page: any): SelectedNewsItem => ({
    id: page.id,
    title: page.properties[CANDIDATE_PROPS.title]?.title?.[0]?.plain_text ?? '',
    url: page.properties[CANDIDATE_PROPS.url]?.url ?? '',
    source: page.properties[CANDIDATE_PROPS.source]?.rich_text?.[0]?.plain_text ?? '',
    summary: page.properties[CANDIDATE_PROPS.summary]?.rich_text?.[0]?.plain_text ?? '',
    category: page.properties[CANDIDATE_PROPS.category]?.select?.name ?? '기타',
  }));
}

async function markAsSelected(pageIds: string[]) {
  await Promise.all(
    pageIds.map((id) =>
      notion.pages.update({
        page_id: id,
        properties: {
          [CANDIDATE_PROPS.isSelected]: { checkbox: true },
        },
      })
    )
  );
}

async function markAsSent(pageIds: string[]) {
  await Promise.all(
    pageIds.map((id) =>
      notion.pages.update({
        page_id: id,
        properties: {
          [CANDIDATE_PROPS.isSent]: { checkbox: true },
        },
      })
    )
  );
}

async function getNextIssueNumber() {
  const res = await notion.dataSources.query({
    data_source_id: NEWSLETTER_COLLECTION_ID,
    page_size: 1,
    sorts: [{ property: NEWSLETTER_PROPS.issueNumber, direction: 'descending' }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestIssue = (res.results[0] as any)?.properties?.[NEWSLETTER_PROPS.issueNumber]?.number ?? 0;
  return latestIssue + 1;
}

function issueLabel() {
  const now = new Date();
  const half = now.getDate() <= 15 ? 1 : 2;
  return `${format(now, 'yyyy년 M월', { locale: ko })} ${half}호`;
}

function buildArchiveSummary(items: SelectedNewsItem[]) {
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const headlinePreview = items
    .slice(0, 3)
    .map((item) => item.title)
    .join(' / ');

  return [
    `고립·은둔 청년 관련 주요 뉴스 ${items.length}건을 묶었습니다.`,
    categories.length > 0 ? `주요 카테고리: ${categories.join(', ')}` : '',
    headlinePreview ? `대표 기사: ${headlinePreview}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

async function archiveNewsletter(issueNumber: number, label: string, items: SelectedNewsItem[]) {
  await notion.pages.create({
    parent: { database_id: NEWSLETTER_DB_ID },
    properties: {
      [NEWSLETTER_PROPS.title]: {
        title: [{ text: { content: `다시봄레터 ${label}` } }],
      },
      [NEWSLETTER_PROPS.issueNumber]: { number: issueNumber },
      [NEWSLETTER_PROPS.publishedAt]: {
        date: { start: new Date().toISOString().slice(0, 10) },
      },
      [NEWSLETTER_PROPS.summary]: {
        rich_text: [{ text: { content: buildArchiveSummary(items) } }],
      },
      [NEWSLETTER_PROPS.isPublic]: { checkbox: true },
    },
  });
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function getRecipients(resend: Resend) {
  const recipients = await listNewsletterRecipients(resend);
  return recipients.map((recipient) => recipient.email);
}

async function getTestRecipients(resend: Resend) {
  const testRecipients = process.env.NEWSLETTER_TEST_TO
    ?.split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  if (testRecipients?.length) {
    return testRecipients;
  }

  return getRecipients(resend);
}

function missingConfig() {
  return [
    !process.env.RESEND_API_KEY ? 'RESEND_API_KEY' : '',
    !process.env.RESEND_FROM ? 'RESEND_FROM' : '',
    !process.env.CRON_SECRET ? 'CRON_SECRET' : '',
  ].filter(Boolean);
}

function autoSelectLimit() {
  const value = Number(process.env.NEWSLETTER_AUTO_SELECT_COUNT ?? 0);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

async function buildDryRunPayload(resend: Resend) {
  const items = await getSelectedItems();
  const autoSelectableItems = items.length === 0
    ? await getAutoSelectableItems(autoSelectLimit())
    : [];
  const recipients = await getRecipients(resend);

  return {
    ready: missingConfig().length === 0
      && (items.length > 0 || autoSelectableItems.length > 0)
      && recipients.length > 0,
    missingEnv: missingConfig(),
    selectedItems: items.length,
    autoSelectLimit: autoSelectLimit(),
    autoSelectableItems: autoSelectableItems.length,
    recipients: recipients.length,
    sampleTitles: (items.length > 0 ? items : autoSelectableItems)
      .slice(0, 5)
      .map((item) => item.title),
    usesResendList: Boolean(process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID),
    issueLabel: issueLabel(),
  };
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    return NextResponse.json(await buildDryRunPayload(resend));
  } catch (e) {
    return NextResponse.json({ error: String(e), missingEnv: missingConfig() }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1';
  const testMode = new URL(req.url).searchParams.get('test') === '1';
  if (dryRun) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      return NextResponse.json(await buildDryRunPayload(resend));
    } catch (e) {
      return NextResponse.json({ error: String(e), missingEnv: missingConfig() }, { status: 500 });
    }
  }

  const from = process.env.RESEND_FROM;
  if (!from) {
    return NextResponse.json(
      { error: 'RESEND_FROM 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    let items = await getSelectedItems();

    if (items.length === 0 || testMode) {
      const autoItems = await getAutoSelectableItems(autoSelectLimit());
      if (autoItems.length > 0) {
        if (!testMode) {
          await markAsSelected(autoItems.map((item) => item.id));
        }
        items = autoItems;
      }
    }

    if (items.length === 0) {
      return NextResponse.json({
        message: '발송할 항목이 없습니다. 노션에서 발송선택을 체크해 주세요.',
      });
    }

    const label = issueLabel();
    const issueNumber = await getNextIssueNumber();
    const recipients = testMode ? await getTestRecipients(resend) : await getRecipients(resend);

    if (recipients.length === 0) {
      return NextResponse.json({
        message: '뉴스레터 수신자가 없습니다.',
      });
    }

    const emailIds: string[] = [];
    const unsubscribeEmail = process.env.NEWSLETTER_UNSUBSCRIBE_EMAIL ?? 'soilabcoop@gmail.com';
    const unsubscribeMailto = `mailto:${unsubscribeEmail}?subject=${encodeURIComponent('뉴스레터 수신거부')}`;
    const hasResendList = Boolean(process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID);

    if (hasResendList) {
      for (const recipientChunk of chunk(recipients, 50)) {
        const { data, error } = await resend.batch.send(
          recipientChunk.map((recipient) => {
            const unsubscribeUrl = createUnsubscribeUrl(recipient);

            return {
              from,
              to: recipient,
              replyTo: process.env.NEWSLETTER_REPLY_TO ?? unsubscribeEmail,
              subject: `${testMode ? '[테스트] ' : ''}[다시봄레터] ${label} - 고립·은둔 청년 뉴스 모음`,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>, <${unsubscribeMailto}>`,
              },
              html: buildEmailHtml({ issueLabel: label, items, unsubscribeUrl }),
              text: buildEmailText({ issueLabel: label, items, unsubscribeUrl }),
            };
          }),
          { batchValidation: 'permissive' }
        );

        if (error) {
          console.error('[send-newsletter] Resend batch error:', error);
          return NextResponse.json({ error }, { status: 500 });
        }

        const batchIds = Array.isArray(data?.data)
          ? data.data.map((item) => item.id).filter(Boolean)
          : [];
        emailIds.push(...batchIds);
      }
    } else {
      for (const recipientChunk of chunk(recipients, 50)) {
        const { data, error } = await resend.emails.send({
          from,
          to: recipientChunk,
          replyTo: process.env.NEWSLETTER_REPLY_TO ?? unsubscribeEmail,
          subject: `${testMode ? '[테스트] ' : ''}[다시봄레터] ${label} - 고립·은둔 청년 뉴스 모음`,
          headers: {
            'List-Unsubscribe': `<${unsubscribeMailto}>`,
          },
          html: buildEmailHtml({ issueLabel: label, items }),
          text: buildEmailText({ issueLabel: label, items }),
        });

        if (error) {
          console.error('[send-newsletter] Resend error:', error);
          return NextResponse.json({ error }, { status: 500 });
        }

        if (data?.id) {
          emailIds.push(data.id);
        }
      }
    }

    if (!testMode) {
      await markAsSent(items.map((item) => item.id));
      await archiveNewsletter(issueNumber, label, items);
      revalidateTag('newsletter', {});
    }

    return NextResponse.json({
      success: true,
      emailIds,
      sent: items.length,
      recipients: recipients.length,
      label,
      issueNumber,
      testMode,
    });
  } catch (e) {
    console.error('[send-newsletter]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

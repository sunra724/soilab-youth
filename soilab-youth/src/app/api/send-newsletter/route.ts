import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Client } from '@notionhq/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { assessNewsPolicy } from '@/config/keywords';
import { buildEmailHtml, buildEmailText } from '@/lib/emailTemplate';
import { collapseRelatedNews } from '@/lib/newsletterDedupe';
import {
  createSmtpTransporter,
  mailerMissingConfig,
  newsletterFrom,
  newsletterMailTransport,
  smtpHost,
  smtpPort,
  smtpSecure,
} from '@/lib/newsletterMailer';
import { recoverResolvedBounceSuppressions } from '@/lib/newsletterSuppression';
import {
  createOneClickUnsubscribeUrl,
  createUnsubscribeUrl,
} from '@/lib/newsletterToken';
import { listNewsletterRecipients } from '@/lib/resendContacts';
import { sendTelegramDigest } from '@/lib/telegram';
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
  publishedAt: string;
  category: string;
}

interface RecentNewsletterEmail {
  id?: string;
  createdAt?: string;
  recipientPreview: string;
  subject?: string;
  lastEvent?: string;
}

interface ResendEmailListItem {
  id?: string;
  created_at?: string;
  to?: string | string[];
  subject?: string;
  last_event?: string;
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CANDIDATES_COLLECTION_ID = process.env.NOTION_CANDIDATES_COLLECTION!;
const NEWSLETTER_DB_ID = process.env.NOTION_NEWSLETTER_DB!;
const NEWSLETTER_COLLECTION_ID = process.env.NOTION_NEWSLETTER_COLLECTION!;
const NEWSLETTER_TIME_ZONE = 'Asia/Seoul';

function usesResendContactList() {
  return Boolean(process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID);
}

function createResendClient() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : undefined;
}

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
    publishedAt: page.properties[CANDIDATE_PROPS.collectedAt]?.date?.start ?? '',
    category: page.properties[CANDIDATE_PROPS.category]?.select?.name ?? '기타',
  }));
}

async function getAutoSelectableItems(limit: number) {
  if (limit <= 0) {
    return [];
  }

  const res = await notion.dataSources.query({
    data_source_id: CANDIDATES_COLLECTION_ID,
    page_size: 100,
    filter: {
      and: [
        { property: CANDIDATE_PROPS.isSent, checkbox: { equals: false } },
        { property: CANDIDATE_PROPS.isSelected, checkbox: { equals: false } },
      ],
    },
    sorts: [{ property: CANDIDATE_PROPS.collectedAt, direction: 'descending' }],
  });

  const candidates = res.results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((page: any): SelectedNewsItem => ({
      id: page.id,
      title: page.properties[CANDIDATE_PROPS.title]?.title?.[0]?.plain_text ?? '',
      url: page.properties[CANDIDATE_PROPS.url]?.url ?? '',
      source: page.properties[CANDIDATE_PROPS.source]?.rich_text?.[0]?.plain_text ?? '',
      summary: page.properties[CANDIDATE_PROPS.summary]?.rich_text?.[0]?.plain_text ?? '',
      publishedAt: page.properties[CANDIDATE_PROPS.collectedAt]?.date?.start ?? '',
      category: page.properties[CANDIDATE_PROPS.category]?.select?.name ?? '기타',
    }));

  const publishedUrls = await getPublishedArchiveUrls();
  return prioritizeAutoSelectableItems(
    candidates.filter((candidate) => !publishedUrls.has(candidate.url)),
    limit,
  );
}

async function getPublishedArchiveUrls() {
  const urls = new Set<string>();
  const archives = await notion.dataSources.query({
    data_source_id: NEWSLETTER_COLLECTION_ID,
    page_size: 30,
    filter: {
      property: NEWSLETTER_PROPS.isPublic,
      checkbox: { equals: true },
    },
    sorts: [{ property: NEWSLETTER_PROPS.publishedAt, direction: 'descending' }],
  });

  await Promise.all(archives.results.map(async (archive) => {
    let startCursor: string | undefined;

    do {
      const blocks = await notion.blocks.children.list({
        block_id: archive.id,
        page_size: 100,
        ...(startCursor ? { start_cursor: startCursor } : {}),
      });

      for (const block of blocks.results) {
        if (!('type' in block) || block.type !== 'bulleted_list_item') continue;
        const href = block.bulleted_list_item.rich_text.find(
          (text) => text.href,
        )?.href;
        if (href) urls.add(href);
      }

      startCursor = blocks.has_more && blocks.next_cursor
        ? blocks.next_cursor
        : undefined;
    } while (startCursor);
  }));

  return urls;
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

function kstDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: NEWSLETTER_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  return {
    year: parts.find((part) => part.type === 'year')?.value ?? '',
    month: parts.find((part) => part.type === 'month')?.value ?? '',
    day: parts.find((part) => part.type === 'day')?.value ?? '',
  };
}

function issueLabel(date = new Date()) {
  const { year, month, day } = kstDateParts(date);
  return `${year}년 ${month}월 ${day}일`;
}

function issueDateKey(date = new Date()) {
  const { year, month, day } = kstDateParts(date);
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function buildArchiveSummary(items: SelectedNewsItem[]) {
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return [
    `고립·은둔 청년과 회복 지원 현장의 등록 언론사 기사 ${items.length}건을 안내합니다.`,
    categories.length > 0 ? `주요 카테고리: ${categories.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

async function archiveNewsletter(issueNumber: number, label: string, items: SelectedNewsItem[]) {
  await notion.pages.create({
    parent: { database_id: NEWSLETTER_DB_ID },
    properties: {
      [NEWSLETTER_PROPS.title]: {
        title: [{ text: { content: `다시봄 뉴스클리핑 ${label}` } }],
      },
      [NEWSLETTER_PROPS.issueNumber]: { number: issueNumber },
      [NEWSLETTER_PROPS.publishedAt]: {
        date: { start: issueDateKey() },
      },
      [NEWSLETTER_PROPS.summary]: {
        rich_text: [{ text: { content: buildArchiveSummary(items) } }],
      },
      [NEWSLETTER_PROPS.isPublic]: { checkbox: true },
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '기사 원문' } }],
        },
      },
      ...items.flatMap((item) => [
        {
          object: 'block' as const,
          type: 'bulleted_list_item' as const,
          bulleted_list_item: {
            rich_text: [{
              type: 'text' as const,
              text: {
                content: item.title,
                link: { url: item.url },
              },
            }],
          },
        },
        {
          object: 'block' as const,
          type: 'paragraph' as const,
          paragraph: {
            rich_text: [{
              type: 'text' as const,
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
    ],
  });
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function fallbackRecipientEmails() {
  return (process.env.NEWSLETTER_TO ?? 'soilabcoop@gmail.com')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

async function getRecipients(resend?: Resend) {
  if (usesResendContactList()) {
    if (!resend) {
      throw new Error('RESEND_API_KEY is required to read the Resend newsletter list.');
    }

    const recipients = await listNewsletterRecipients(resend);
    return recipients.map((recipient) => recipient.email);
  }

  return fallbackRecipientEmails();
}

async function getTestRecipients(resend?: Resend) {
  const testRecipients = process.env.NEWSLETTER_TEST_TO
    ?.split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  if (testRecipients?.length) {
    return testRecipients;
  }

  return getRecipients(resend);
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function firstRecipientPreview(to?: string | string[]) {
  const value = Array.isArray(to) ? to[0] : to;
  return value ? maskEmail(value) : '';
}

async function listRecentNewsletterEmails(resend: Resend): Promise<{
  items: RecentNewsletterEmail[];
  error?: string;
}> {
  try {
    const { data, error } = await resend.emails.list({ limit: 20 });

    if (error) {
      return { items: [], error: JSON.stringify(error) };
    }

    const emails = ((data as { data?: ResendEmailListItem[] } | null)?.data ?? [])
      .filter((email) => email.subject?.includes('[다시봄 뉴스클리핑]'))
      .slice(0, 10)
      .map((email) => ({
        id: email.id,
        createdAt: email.created_at,
        recipientPreview: firstRecipientPreview(email.to),
        subject: email.subject,
        lastEvent: email.last_event,
      }));

    return { items: emails };
  } catch (error) {
    return {
      items: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function missingConfig() {
  return Array.from(new Set([
    ...mailerMissingConfig(),
    usesResendContactList() && !process.env.RESEND_API_KEY ? 'RESEND_API_KEY' : '',
  ].filter(Boolean)));
}

function autoSelectLimit() {
  const value = Number(process.env.NEWSLETTER_AUTO_SELECT_COUNT ?? 0);
  return Number.isFinite(value) && value > 0
    ? Math.min(7, Math.floor(value))
    : 0;
}

function isSendableItem(item: SelectedNewsItem, allowReviewedSensitive: boolean) {
  if (item.category === '검수대기') {
    return false;
  }

  return assessNewsPolicy({
    title: item.title,
    description: item.summary,
    source: item.source,
    url: item.url,
    requirePublisher: true,
    allowReviewedSensitive,
  }).status === 'accepted';
}

function prioritizeAutoSelectableItems(items: SelectedNewsItem[], limit: number) {
  return collapseRelatedNews(
    items.filter((item) => isSendableItem(item, false)),
  )
    .slice(0, Math.min(7, limit));
}

function itemMix(items: SelectedNewsItem[]) {
  return {
    articles: items.length,
    videos: 0,
    impact: 0,
  };
}

async function getReviewPendingCount() {
  let count = 0;
  let startCursor: string | undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: CANDIDATES_COLLECTION_ID,
      page_size: 100,
      filter: {
        and: [
          { property: CANDIDATE_PROPS.category, select: { equals: '검수대기' } },
          { property: CANDIDATE_PROPS.isSent, checkbox: { equals: false } },
        ],
      },
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });
    count += res.results.length;
    startCursor = res.has_more && res.next_cursor
      ? res.next_cursor
      : undefined;
  } while (startCursor);

  return count;
}

async function buildDryRunPayload(resend?: Resend) {
  const selectedItems = await getSelectedItems();
  const items = selectedItems.filter((item) => isSendableItem(item, true));
  const autoSelectableItems = items.length === 0
    ? await getAutoSelectableItems(autoSelectLimit())
    : [];
  const selectedMix = itemMix(items);
  const autoSelectableMix = itemMix(autoSelectableItems);
  const recipients = await getRecipients(resend);
  const testRecipients = await getTestRecipients(resend);
  const recentNewsletterEmails = resend
    ? await listRecentNewsletterEmails(resend)
    : { items: [] };
  const transport = newsletterMailTransport();

  return {
    ready: missingConfig().length === 0
      && (items.length > 0 || autoSelectableItems.length > 0)
      && recipients.length > 0,
    missingEnv: missingConfig(),
    selectedItems: items.length,
    selectedRejectedItems: selectedItems.length - items.length,
    reviewPendingItems: await getReviewPendingCount(),
    selectedArticleItems: selectedMix.articles,
    selectedVideoItems: selectedMix.videos,
    selectedImpactItems: selectedMix.impact,
    autoSelectLimit: autoSelectLimit(),
    autoSelectArticleRatio: 1,
    autoSelectArticleTarget: autoSelectLimit(),
    autoSelectImpactLimit: 0,
    autoSelectableItems: autoSelectableItems.length,
    autoSelectableArticleItems: autoSelectableMix.articles,
    autoSelectableVideoItems: autoSelectableMix.videos,
    autoSelectableImpactItems: autoSelectableMix.impact,
    recipients: recipients.length,
    recipientPreview: recipients.slice(0, 5).map(maskEmail),
    testRecipients: testRecipients.length,
    testRecipientPreview: testRecipients.slice(0, 5).map(maskEmail),
    testRecipientSource: process.env.NEWSLETTER_TEST_TO ? 'NEWSLETTER_TEST_TO' : 'newsletter-list',
    sampleTitles: (items.length > 0 ? items : autoSelectableItems)
      .slice(0, 5)
      .map((item) => item.title),
    recentNewsletterEmails: recentNewsletterEmails.items,
    recentNewsletterEmailError: recentNewsletterEmails.error,
    mailTransport: transport,
    smtpHost: transport === 'smtp' ? smtpHost() : undefined,
    smtpPort: transport === 'smtp' ? smtpPort() : undefined,
    smtpSecure: transport === 'smtp' ? smtpSecure() : undefined,
    fromConfigured: Boolean(newsletterFrom()),
    usesResendList: usesResendContactList(),
    issueLabel: issueLabel(),
  };
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resend = createResendClient();
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
      const resend = createResendClient();
      return NextResponse.json(await buildDryRunPayload(resend));
    } catch (e) {
      return NextResponse.json({ error: String(e), missingEnv: missingConfig() }, { status: 500 });
    }
  }

  const configErrors = missingConfig();
  if (configErrors.length > 0) {
    return NextResponse.json(
      { error: '뉴스레터 발송 환경변수가 설정되지 않았습니다.', missingEnv: configErrors },
      { status: 500 }
    );
  }

  const from = newsletterFrom();
  if (!from) {
    return NextResponse.json(
      { error: 'NEWSLETTER_FROM 또는 SMTP_FROM/RESEND_FROM 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const resend = createResendClient();
    const manuallySelected = await getSelectedItems();
    let items = manuallySelected.filter((item) => isSendableItem(item, true));

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
    const unsubscribeEmail = process.env.NEWSLETTER_UNSUBSCRIBE_EMAIL ?? 'youth-news@soilabcoop.kr';
    const unsubscribeMailto = `mailto:${unsubscribeEmail}?subject=${encodeURIComponent('뉴스레터 수신거부')}`;
    const mailTransport = newsletterMailTransport();
    const hasResendList = usesResendContactList();
    const recoveredSuppressions = mailTransport === 'resend' && resend
      ? await recoverResolvedBounceSuppressions(resend, recipients)
      : [];

    if (recoveredSuppressions.length > 0) {
      console.info(
        '[send-newsletter] Recovered stale bounce suppressions:',
        recoveredSuppressions.map((suppression) => maskEmail(suppression.email))
      );
    }

    if (mailTransport === 'smtp') {
      const transporter = createSmtpTransporter();

      for (const recipient of recipients) {
        const unsubscribeUrl = createUnsubscribeUrl(recipient);
        const oneClickUrl = createOneClickUnsubscribeUrl(recipient);
        const info = await transporter.sendMail({
          from,
          to: recipient,
          replyTo: process.env.NEWSLETTER_REPLY_TO ?? unsubscribeEmail,
          subject: `${testMode ? '[테스트] ' : ''}[다시봄 뉴스클리핑] ${label} - 오늘의 주요 뉴스`,
          headers: {
            'List-Unsubscribe': `<${oneClickUrl}>, <${unsubscribeMailto}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          html: buildEmailHtml({ issueLabel: label, items, unsubscribeUrl }),
          text: buildEmailText({ issueLabel: label, items, unsubscribeUrl }),
        });

        emailIds.push(info.messageId ?? info.response ?? recipient);
      }
    } else if (hasResendList) {
      if (!resend) {
        throw new Error('RESEND_API_KEY is required for Resend newsletter sending.');
      }

      for (const recipientChunk of chunk(recipients, 50)) {
        const { data, error } = await resend.batch.send(
          recipientChunk.map((recipient) => {
            const unsubscribeUrl = createUnsubscribeUrl(recipient);
            const oneClickUrl = createOneClickUnsubscribeUrl(recipient);

            return {
              from,
              to: recipient,
              replyTo: process.env.NEWSLETTER_REPLY_TO ?? unsubscribeEmail,
              subject: `${testMode ? '[테스트] ' : ''}[다시봄 뉴스클리핑] ${label} - 오늘의 주요 뉴스`,
              headers: {
                'List-Unsubscribe': `<${oneClickUrl}>, <${unsubscribeMailto}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
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
      if (!resend) {
        throw new Error('RESEND_API_KEY is required for Resend newsletter sending.');
      }

      for (const recipientChunk of chunk(recipients, 50)) {
        const { data, error } = await resend.emails.send({
          from,
          to: recipientChunk,
          replyTo: process.env.NEWSLETTER_REPLY_TO ?? unsubscribeEmail,
          subject: `${testMode ? '[테스트] ' : ''}[다시봄 뉴스클리핑] ${label} - 오늘의 주요 뉴스`,
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
      revalidateTag('newsletter', { expire: 0 });
      revalidatePath('/newsletter');
      revalidatePath('/newsletter/[id]', 'page');
    }

    let telegramSkipped = true;
    let telegramSkipReason: string | undefined;
    let telegramMessageIds: number[] = [];
    let telegramError: string | undefined;

    try {
      const telegramResult = await sendTelegramDigest({
        issueLabel: label,
        items,
        testMode,
      });
      telegramSkipped = telegramResult.skipped;
      telegramSkipReason = telegramResult.reason;
      telegramMessageIds = telegramResult.messageIds;
    } catch (error) {
      telegramSkipped = false;
      telegramError = error instanceof Error ? error.message : String(error);
      console.error('[send-newsletter] Telegram error:', error);
    }

    const sentMix = itemMix(items);

    return NextResponse.json({
      success: true,
      emailIds,
      sent: items.length,
      sentArticleItems: sentMix.articles,
      sentVideoItems: sentMix.videos,
      sentImpactItems: sentMix.impact,
      recipients: recipients.length,
      recipientPreview: recipients.slice(0, 5).map(maskEmail),
      mailTransport,
      recoveredSuppressions: recoveredSuppressions.length,
      recoveredSuppressionPreview: recoveredSuppressions.map((suppression) =>
        maskEmail(suppression.email)
      ),
      label,
      issueNumber,
      testMode,
      telegramSkipped,
      telegramSkipReason,
      telegramMessageIds,
      telegramError,
    });
  } catch (e) {
    console.error('[send-newsletter]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

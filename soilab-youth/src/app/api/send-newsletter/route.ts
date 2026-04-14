import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Client } from '@notionhq/client';
import { buildEmailHtml, buildEmailText } from '@/lib/emailTemplate';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_CANDIDATES_DB!;

// 발송선택=true, 발송완료=false 항목 가져오기
async function getSelectedItems() {
  const res = await notion.dataSources.query({
    data_source_id: DB_ID,
    filter: {
      and: [
        { property: '발송선택', checkbox: { equals: true } },
        { property: '발송완료', checkbox: { equals: false } },
      ],
    },
    sorts: [{ property: '카테고리', direction: 'ascending' }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.results.map((page: any) => ({
    id: page.id,
    title:    page.properties['제목']?.title?.[0]?.plain_text ?? '',
    url:      page.properties['원문링크']?.url ?? '',
    source:   page.properties['출처']?.rich_text?.[0]?.plain_text ?? '',
    summary:  page.properties['요약']?.rich_text?.[0]?.plain_text ?? '',
    category: page.properties['카테고리']?.select?.name ?? '기타',
  }));
}

// 발송완료 표시
async function markAsSent(pageIds: string[]) {
  await Promise.all(
    pageIds.map((id) =>
      notion.pages.update({
        page_id: id,
        properties: { '발송완료': { checkbox: true } },
      })
    )
  );
}

// 호수 레이블 생성 (예: "2026년 4월 1호")
function issueLabel() {
  const now = new Date();
  const half = now.getDate() <= 15 ? 1 : 2;
  return format(now, 'yyyy년 M월', { locale: ko }) + ` ${half}호`;
}

export async function POST(req: Request) {
  // 수동 트리거 or cron
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const items = await getSelectedItems();

    if (items.length === 0) {
      return NextResponse.json({ message: '발송할 항목이 없습니다. 노션에서 발송선택을 체크해주세요.' });
    }

    const label = issueLabel();
    const html = buildEmailHtml({ issueLabel: label, items });
    const text = buildEmailText({ issueLabel: label, items });

    const to = process.env.NEWSLETTER_TO ?? 'soilabcoop@gmail.com';
    const from = process.env.RESEND_FROM ?? 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from,
      to: to.split(',').map((e) => e.trim()),
      subject: `[다시봄레터] ${label} — 고립·은둔 청년 뉴스 모음`,
      html,
      text,
    });

    if (error) {
      console.error('[send-newsletter] Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    // 발송 완료 처리
    await markAsSent(items.map((i) => i.id));

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      sent: items.length,
      label,
    });
  } catch (e) {
    console.error('[send-newsletter]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

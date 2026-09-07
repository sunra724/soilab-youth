import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  createNewsletterBackfill,
  previewNewsletterBackfill,
} from '@/lib/newsletterBackfill';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret)
    && req.headers.get('authorization') === `Bearer ${secret}`;
}

function rangeFromRequest(req: Request) {
  const params = new URL(req.url).searchParams;
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  if (!from || !to) {
    throw new Error('from과 to를 YYYY-MM-DD 형식으로 지정해 주세요.');
  }
  return { from, to };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { from, to } = rangeFromRequest(req);
    const result = await previewNewsletterBackfill(from, to);
    return NextResponse.json({ dryRun: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { from, to } = rangeFromRequest(req);
    const result = await createNewsletterBackfill(from, to);

    if (result.generatedDates.length > 0) {
      revalidateTag('newsletter', { expire: 0 });
      revalidatePath('/newsletter');
      revalidatePath('/newsletter/[id]', 'page');
    }

    return NextResponse.json({
      success: true,
      archiveOnly: true,
      ...result,
    });
  } catch (error) {
    console.error('[newsletter-backfill]', error);
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

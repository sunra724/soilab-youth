import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';
import {
  enforceNewsletterSubscriptionLimits,
  sendNewsletterConfirmation,
} from '@/lib/newsletterSubscription';
import { normalizeEmail } from '@/lib/newsletterToken';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SubscribeRequest {
  email?: unknown;
  consent?: unknown;
  overseasTransferConsent?: unknown;
  website?: unknown;
}

function isValidEmail(email: string) {
  return email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function genericSuccess(startedAt: number) {
  const target = 500 + randomInt(0, 151);
  const remaining = target - (Date.now() - startedAt);
  if (remaining > 0) await sleep(remaining);

  return NextResponse.json(
    {
      success: true,
      message: '이미 구독 중이거나 확인 메일을 보냈습니다. 받은편지함을 확인해 주세요.',
    },
    {
      status: 202,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  let body: SubscribeRequest;

  try {
    body = await req.json() as SubscribeRequest;
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return genericSuccess(startedAt);
  }

  const email = typeof body.email === 'string'
    ? normalizeEmail(body.email)
    : '';
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해 주세요.' }, { status: 400 });
  }
  if (body.consent !== true || body.overseasTransferConsent !== true) {
    return NextResponse.json(
      { error: '필수 개인정보 동의 항목을 확인해 주세요.' },
      { status: 400 },
    );
  }

  const allowed = await enforceNewsletterSubscriptionLimits(req, email);
  if (!allowed) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': '600',
        },
      },
    );
  }

  try {
    await sendNewsletterConfirmation(email);
  } catch (error) {
    console.error(
      '[subscribe-newsletter] confirmation failed:',
      error instanceof Error ? error.message : String(error),
    );
  }

  return genericSuccess(startedAt);
}

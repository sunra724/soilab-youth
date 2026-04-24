import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  normalizeEmail,
  verifyUnsubscribeToken,
} from '@/lib/newsletterToken';
import { unsubscribeFromNewsletter } from '@/lib/resendContacts';

export async function POST(req: Request) {
  let email = '';
  let token = '';

  try {
    const body = await req.json();
    email = normalizeEmail(String(body?.email ?? ''));
    token = String(body?.token ?? '');
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: '수신거부 링크가 올바르지 않습니다.' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await unsubscribeFromNewsletter(resend, email);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

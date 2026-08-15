import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { subscribeToNewsletter } from '@/lib/resendContacts';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let email = '';
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: '올바른 이메일 주소를 입력해 주세요.' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await subscribeToNewsletter(resend, email);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '구독 신청을 처리하지 못했습니다.' },
      { status: 503 }
    );
  }
}

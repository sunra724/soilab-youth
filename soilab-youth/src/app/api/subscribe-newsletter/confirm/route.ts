import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { subscribeToNewsletter } from '@/lib/resendContacts';
import { verifyConfirmationToken } from '@/lib/newsletterToken';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const form = await request.formData();
  const token = form.get('token');
  const payload = typeof token === 'string'
    ? verifyConfirmationToken(token)
    : null;

  if (!payload || !process.env.RESEND_API_KEY) {
    return NextResponse.redirect(
      new URL('/newsletter/confirmed?status=invalid', request.url),
      303,
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await subscribeToNewsletter(resend, payload.email);
    if (error) throw new Error(JSON.stringify(error));

    return NextResponse.redirect(
      new URL('/newsletter/confirmed?status=done', request.url),
      303,
    );
  } catch (error) {
    console.error('[subscribe-newsletter/confirm]', error);
    return NextResponse.redirect(
      new URL('/newsletter/confirmed?status=failed', request.url),
      303,
    );
  }
}

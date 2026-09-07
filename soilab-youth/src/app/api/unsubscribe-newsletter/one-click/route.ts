import { Resend } from 'resend';
import {
  normalizeEmail,
  verifyUnsubscribeToken,
} from '@/lib/newsletterToken';
import { unsubscribeFromNewsletter } from '@/lib/resendContacts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get('email') ?? '');
  const token = url.searchParams.get('token') ?? '';

  if (
    email
    && token
    && verifyUnsubscribeToken(email, token)
    && process.env.RESEND_API_KEY
  ) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await unsubscribeFromNewsletter(resend, email);
  }

  return new Response(null, { status: 204 });
}

import { createHmac, timingSafeEqual } from 'crypto';

function secret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ?? process.env.CRON_SECRET ?? '';
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createUnsubscribeToken(email: string) {
  return createHmac('sha256', secret())
    .update(normalizeEmail(email))
    .digest('base64url');
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = createUnsubscribeToken(email);

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function createUnsubscribeUrl(email: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soilab-youth.kr';
  const url = new URL('/unsubscribe', siteUrl);
  url.searchParams.set('email', normalizeEmail(email));
  url.searchParams.set('token', createUnsubscribeToken(email));
  return url.toString();
}

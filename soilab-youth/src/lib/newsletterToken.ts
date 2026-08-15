import { createHmac, timingSafeEqual } from 'crypto';

const PRIMARY_SITE_URL = 'https://www.soilab-youth.kr';

function publicSiteUrl() {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? PRIMARY_SITE_URL);
  if (url.hostname === 'soilab-youth.kr') {
    url.hostname = 'www.soilab-youth.kr';
  }
  return url;
}

function secret() {
  return process.env.NEWSLETTER_SUBSCRIPTION_SECRET
    ?? process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
    ?? process.env.CRON_SECRET
    ?? '';
}

export const NEWSLETTER_CONSENT_VERSION = '2026-07-29';

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
  const url = new URL('/unsubscribe', publicSiteUrl());
  url.searchParams.set('email', normalizeEmail(email));
  url.searchParams.set('token', createUnsubscribeToken(email));
  return url.toString();
}

export function createOneClickUnsubscribeUrl(email: string) {
  const url = new URL('/api/unsubscribe-newsletter/one-click', publicSiteUrl());
  url.searchParams.set('email', normalizeEmail(email));
  url.searchParams.set('token', createUnsubscribeToken(email));
  return url.toString();
}

interface ConfirmationPayload {
  email: string;
  expiresAt: number;
  consentVersion: string;
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createConfirmationToken(
  email: string,
  now = Date.now(),
  expiresInMs = 24 * 60 * 60 * 1000,
) {
  const payload: ConfirmationPayload = {
    email: normalizeEmail(email),
    expiresAt: now + expiresInMs,
    consentVersion: NEWSLETTER_CONSENT_VERSION,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifyConfirmationToken(token: string, now = Date.now()) {
  const [encoded, signature, ...rest] = token.split('.');
  if (!encoded || !signature || rest.length > 0) return null;

  const expected = sign(encoded);
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as ConfirmationPayload;
    if (
      !payload.email
      || payload.expiresAt < now
      || payload.consentVersion !== NEWSLETTER_CONSENT_VERSION
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function createConfirmationUrl(email: string) {
  const url = new URL('/newsletter/confirm', publicSiteUrl());
  url.searchParams.set('token', createConfirmationToken(email));
  return url.toString();
}

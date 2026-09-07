import 'server-only';

import { createHmac } from 'crypto';
import { Resend } from 'resend';
import { getMorningConfiguration, morningRpc } from '@/lib/morning/db';
import { newsletterFrom } from '@/lib/newsletterMailer';
import { createConfirmationUrl } from '@/lib/newsletterToken';

const localLimits = new Map<string, { count: number; expiresAt: number }>();

function hashKey(scope: string, value: string) {
  const secret = process.env.NEWSLETTER_SUBSCRIPTION_SECRET
    ?? process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
    ?? process.env.CRON_SECRET
    ?? 'development-only';
  return createHmac('sha256', secret)
    .update(`${scope}:${value}`)
    .digest('hex');
}

function clientAddress(request: Request) {
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || (process.env.NODE_ENV !== 'production'
      ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      : '')
    || 'unknown';
}

async function consumeLimit(keyHash: string, action: string, limit: number, windowSeconds: number) {
  if (getMorningConfiguration().configured) {
    return morningRpc<boolean>('morning_consume_rate_limit', {
      p_key_hash: keyHash,
      p_action: action,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
  }

  const now = Date.now();
  const current = localLimits.get(`${action}:${keyHash}`);
  const next = !current || current.expiresAt <= now
    ? { count: 1, expiresAt: now + windowSeconds * 1000 }
    : { ...current, count: current.count + 1 };
  localLimits.set(`${action}:${keyHash}`, next);
  return next.count <= limit;
}

export async function enforceNewsletterSubscriptionLimits(request: Request, email: string) {
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeLimit(
      hashKey('ip', clientAddress(request)),
      'newsletter-subscribe-ip',
      4,
      10 * 60,
    ),
    consumeLimit(
      hashKey('email', email),
      'newsletter-subscribe-email',
      3,
      24 * 60 * 60,
    ),
  ]);
  return ipAllowed && emailAllowed;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendNewsletterConfirmation(email: string) {
  const from = newsletterFrom();
  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error('뉴스레터 확인 메일 설정이 완료되지 않았습니다.');
  }

  const confirmUrl = createConfirmationUrl(email);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to: email,
    replyTo: process.env.NEWSLETTER_REPLY_TO ?? 'youth-news@soilabcoop.kr',
    subject: '다시봄 뉴스클리핑 구독을 확인해 주세요',
    html: `
      <div style="margin:0 auto;max-width:600px;padding:32px 20px;font-family:Arial,'Noto Sans KR',sans-serif;color:#1a1f36">
        <p style="margin:0;color:#248dac;font-size:12px;font-weight:700;letter-spacing:.08em">SOILAB DASIBOM</p>
        <h1 style="margin:12px 0 0;font-size:25px;line-height:1.4">다시봄 뉴스클리핑 이메일 구독</h1>
        <p style="margin:18px 0 0;color:#52616b;font-size:15px;line-height:1.75">
          아래 버튼을 누르면 구독이 시작됩니다. 관련 뉴스가 없는 날에는 메일을 보내지 않습니다.
        </p>
        <a href="${escapeHtml(confirmUrl)}" style="display:inline-block;margin-top:24px;border-radius:10px;background:#46549c;padding:13px 20px;color:#fff;text-decoration:none;font-size:14px;font-weight:700">
          이메일 구독 확인하기
        </a>
        <p style="margin:24px 0 0;color:#8a93a3;font-size:12px;line-height:1.7">
          본인이 신청하지 않았다면 이 메일을 무시해 주세요. 확인 링크는 24시간 동안 유효합니다.
        </p>
      </div>
    `.trim(),
    text: [
      '다시봄 뉴스클리핑 이메일 구독',
      '',
      '아래 링크를 열고 확인하면 구독이 시작됩니다.',
      confirmUrl,
      '',
      '본인이 신청하지 않았다면 이 메일을 무시해 주세요.',
    ].join('\n'),
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }
}

import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type NewsletterMailTransport = 'resend' | 'smtp';

function env(name: string) {
  return process.env[name]?.trim();
}

function boolEnv(name: string) {
  const value = env(name)?.toLowerCase();
  if (value === '1' || value === 'true' || value === 'yes') {
    return true;
  }

  if (value === '0' || value === 'false' || value === 'no') {
    return false;
  }

  return undefined;
}

export function smtpHost() {
  return env('SMTP_HOST') ?? env('MAIL_HOST');
}

export function smtpUser() {
  return env('SMTP_USER') ?? env('MAIL_USER');
}

export function smtpPassword() {
  return env('SMTP_PASS') ?? env('SMTP_PASSWORD') ?? env('MAIL_PASS') ?? env('MAIL_PASSWORD');
}

export function smtpPort() {
  const configured = Number(env('SMTP_PORT') ?? env('MAIL_PORT'));
  if (Number.isFinite(configured) && configured > 0) {
    return Math.floor(configured);
  }

  return smtpHost()?.startsWith('smtps.') ? 465 : 587;
}

export function smtpSecure() {
  return boolEnv('SMTP_SECURE') ?? smtpPort() === 465;
}

function smtpAuthDisabled() {
  return boolEnv('SMTP_AUTH_DISABLED') === true || boolEnv('SMTP_AUTH') === false;
}

export function newsletterMailTransport(): NewsletterMailTransport {
  const configured = env('NEWSLETTER_MAIL_TRANSPORT')?.toLowerCase();
  if (configured === 'smtp' || configured === 'resend') {
    return configured;
  }

  return 'resend';
}

export function newsletterFrom() {
  return env('NEWSLETTER_FROM')
    ?? env('SMTP_FROM')
    ?? env('MAIL_FROM')
    ?? env('RESEND_FROM')
    ?? smtpUser();
}

export function mailerMissingConfig() {
  const missing = [
    !process.env.CRON_SECRET ? 'CRON_SECRET' : '',
    !newsletterFrom() ? 'NEWSLETTER_FROM|SMTP_FROM|RESEND_FROM' : '',
  ];

  if (newsletterMailTransport() === 'smtp') {
    missing.push(!smtpHost() ? 'SMTP_HOST' : '');

    if (!smtpAuthDisabled()) {
      missing.push(!smtpUser() ? 'SMTP_USER' : '');
      missing.push(!smtpPassword() ? 'SMTP_PASS' : '');
    }
  } else {
    missing.push(!process.env.RESEND_API_KEY ? 'RESEND_API_KEY' : '');
    missing.push(!process.env.RESEND_FROM ? 'RESEND_FROM' : '');
  }

  return missing.filter(Boolean);
}

export function createSmtpTransporter() {
  const host = smtpHost();
  if (!host) {
    throw new Error('SMTP_HOST is required for SMTP newsletter sending.');
  }

  const auth = smtpAuthDisabled()
    ? undefined
    : {
        user: smtpUser(),
        pass: smtpPassword(),
      };

  return nodemailer.createTransport({
    host,
    port: smtpPort(),
    secure: smtpSecure(),
    auth,
  } satisfies SMTPTransport.Options);
}

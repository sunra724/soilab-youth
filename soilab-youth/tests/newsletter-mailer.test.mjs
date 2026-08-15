import assert from 'node:assert/strict';
import test from 'node:test';
import { newsletterMailTransport } from '../src/lib/newsletterMailer.ts';

const originalTransport = process.env.NEWSLETTER_MAIL_TRANSPORT;
const originalSmtpHost = process.env.SMTP_HOST;

function restoreEnvironment() {
  if (originalTransport === undefined) {
    delete process.env.NEWSLETTER_MAIL_TRANSPORT;
  } else {
    process.env.NEWSLETTER_MAIL_TRANSPORT = originalTransport;
  }

  if (originalSmtpHost === undefined) {
    delete process.env.SMTP_HOST;
  } else {
    process.env.SMTP_HOST = originalSmtpHost;
  }
}

test.after(restoreEnvironment);

test('defaults to Resend even when legacy SMTP settings remain', () => {
  delete process.env.NEWSLETTER_MAIL_TRANSPORT;
  process.env.SMTP_HOST = 'smtp.example.com';

  assert.equal(newsletterMailTransport(), 'resend');
});

test('uses SMTP only when it is explicitly selected', () => {
  process.env.NEWSLETTER_MAIL_TRANSPORT = 'smtp';
  process.env.SMTP_HOST = 'smtp.example.com';

  assert.equal(newsletterMailTransport(), 'smtp');
});

test('honors an explicit Resend selection', () => {
  process.env.NEWSLETTER_MAIL_TRANSPORT = 'resend';
  process.env.SMTP_HOST = 'smtp.example.com';

  assert.equal(newsletterMailTransport(), 'resend');
});

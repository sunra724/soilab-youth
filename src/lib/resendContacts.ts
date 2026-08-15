import { Resend } from 'resend';

export interface NewsletterRecipient {
  email: string;
}

export function contactListTarget() {
  const segmentId = process.env.RESEND_SEGMENT_ID;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (segmentId) {
    return { type: 'segment' as const, id: segmentId };
  }

  if (audienceId) {
    return { type: 'audience' as const, id: audienceId };
  }

  return null;
}

export async function listNewsletterRecipients(resend: Resend) {
  const target = contactListTarget();

  if (!target) {
    return (process.env.NEWSLETTER_TO ?? 'soilabcoop@gmail.com')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)
      .map((email): NewsletterRecipient => ({ email }));
  }

  const recipients: NewsletterRecipient[] = [];
  let after: string | undefined;

  do {
    const { data, error } = await resend.contacts.list({
      [target.type === 'segment' ? 'segmentId' : 'audienceId']: target.id,
      limit: 100,
      ...(after ? { after } : {}),
    });

    if (error) {
      throw new Error(`Resend contacts list failed: ${JSON.stringify(error)}`);
    }

    const contacts = data?.data ?? [];
    recipients.push(
      ...contacts
        .filter((contact) => !contact.unsubscribed)
        .map((contact) => ({ email: contact.email }))
    );

    after = data?.has_more && contacts.length > 0 ? contacts[contacts.length - 1].id : undefined;
  } while (after);

  return recipients;
}

export async function subscribeToNewsletter(resend: Resend, email: string) {
  const target = contactListTarget();
  if (!target) {
    throw new Error('뉴스레터 구독자 목록 설정이 아직 완료되지 않았습니다.');
  }

  if (target.type === 'audience') {
    const { data: existing } = await resend.contacts.get({
      audienceId: target.id,
      email,
    });

    if (existing?.id) {
      return resend.contacts.update({
        audienceId: target.id,
        email,
        unsubscribed: false,
      });
    }

    return resend.contacts.create({
      audienceId: target.id,
      email,
      unsubscribed: false,
    });
  }

  const { data: existing } = await resend.contacts.get({ email });

  if (existing?.id) {
    const updated = await resend.contacts.update({
      email,
      unsubscribed: false,
    });

    if (!updated.error) {
      await resend.contacts.segments.add({ email, segmentId: target.id });
    }

    return updated;
  }

  return resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: target.id }],
  });
}

export async function unsubscribeFromNewsletter(resend: Resend, email: string) {
  const target = contactListTarget();

  if (target?.type === 'audience') {
    return resend.contacts.update({
      audienceId: target.id,
      email,
      unsubscribed: true,
    });
  }

  return resend.contacts.update({
    email,
    unsubscribed: true,
  });
}

import type { Resend } from 'resend';

const SUCCESSFUL_DELIVERY_EVENTS = new Set(['delivered', 'opened', 'clicked']);

export interface NewsletterSuppression {
  id: string;
  email: string;
  origin: 'bounce' | 'complaint' | 'manual';
  created_at: string;
}

export interface NewsletterDelivery {
  id: string;
  to: string | string[];
  created_at: string;
  last_event: string;
}

export interface RecoverableBounceSuppression {
  suppressionId: string;
  email: string;
  evidenceEmailId: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function recipientEmails(delivery: NewsletterDelivery) {
  return (Array.isArray(delivery.to) ? delivery.to : [delivery.to]).map(normalizeEmail);
}

function timestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function findRecoverableBounceSuppressions(
  suppressions: NewsletterSuppression[],
  deliveries: NewsletterDelivery[],
  recipients: string[]
) {
  const intendedRecipients = new Set(recipients.map(normalizeEmail));

  return suppressions.flatMap((suppression): RecoverableBounceSuppression[] => {
    const email = normalizeEmail(suppression.email);
    if (suppression.origin !== 'bounce' || !intendedRecipients.has(email)) {
      return [];
    }

    const suppressedAt = timestamp(suppression.created_at);
    if (suppressedAt === undefined) {
      return [];
    }

    const evidence = deliveries.find((delivery) => {
      const deliveredAt = timestamp(delivery.created_at);
      return SUCCESSFUL_DELIVERY_EVENTS.has(delivery.last_event)
        && deliveredAt !== undefined
        && deliveredAt > suppressedAt
        && recipientEmails(delivery).includes(email);
    });

    return evidence
      ? [{
          suppressionId: suppression.id,
          email: suppression.email,
          evidenceEmailId: evidence.id,
        }]
      : [];
  });
}

export async function recoverResolvedBounceSuppressions(
  resend: Resend,
  recipients: string[]
) {
  const { data: suppressionList, error: suppressionError } = await resend.suppressions.list({
    limit: 100,
  });

  if (suppressionError) {
    throw new Error(`Resend suppression list failed: ${JSON.stringify(suppressionError)}`);
  }

  const relevantSuppressions = (suppressionList?.data ?? []).filter((suppression) =>
    recipients.some((recipient) => normalizeEmail(recipient) === normalizeEmail(suppression.email))
  );

  if (relevantSuppressions.length === 0) {
    return [] satisfies RecoverableBounceSuppression[];
  }

  const { data: emailList, error: emailError } = await resend.emails.list({ limit: 100 });
  if (emailError) {
    throw new Error(`Resend email history failed: ${JSON.stringify(emailError)}`);
  }

  const recoverable = findRecoverableBounceSuppressions(
    relevantSuppressions as NewsletterSuppression[],
    (emailList?.data ?? []) as NewsletterDelivery[],
    recipients
  );

  for (const suppression of recoverable) {
    const { data, error } = await resend.suppressions.remove(suppression.suppressionId);
    if (error || !data?.deleted) {
      throw new Error(
        `Resend suppression removal failed for ${suppression.email}: ${JSON.stringify(error ?? data)}`
      );
    }
  }

  return recoverable;
}

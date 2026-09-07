'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

type SubmitState = 'idle' | 'success' | 'error';

export default function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [overseasConsent, setOverseasConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setState('idle');
      setMessage('');

      try {
        const res = await fetch('/api/subscribe-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            consent,
            overseasTransferConsent: overseasConsent,
            website: '',
          }),
        });
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload.error ?? '구독 신청을 처리하지 못했습니다.');
        }

        setState('success');
        setEmail('');
        setConsent(false);
        setOverseasConsent(false);
        setMessage(
          payload.message
            ?? '확인 메일을 보냈습니다. 받은편지함에서 구독을 확인해 주세요.',
        );
      } catch (error) {
        setState('error');
        setMessage(
          error instanceof Error
            ? error.message
            : '구독 신청을 처리하지 못했습니다.',
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          이메일 주소
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@example.com"
          autoComplete="email"
          required
          disabled={isPending}
          className="min-h-11 flex-1 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition-colors focus:border-[#46549C] disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isPending || !consent || !overseasConsent}
          className="min-h-11 rounded-lg px-5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:bg-gray-300"
          style={!isPending && consent && overseasConsent ? { background: '#46549C' } : undefined}
        >
          {isPending ? '처리 중' : '구독 신청'}
        </button>
      </div>

      <div className="space-y-2 text-xs leading-5 text-gray-600">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#46549C]"
          />
          <span>
            (필수) 이메일 수집·이용에 동의합니다.{' '}
            <Link href="/newsletter/privacy" className="font-semibold underline">
              자세히
            </Link>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={overseasConsent}
            onChange={(event) => setOverseasConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#46549C]"
          />
          <span>
            (필수) 이메일 발송을 위한 개인정보 국외 이전에 동의합니다.{' '}
            <Link href="/newsletter/privacy#overseas" className="font-semibold underline">
              자세히
            </Link>
          </span>
        </label>
      </div>

      {message && (
        <p
          className={`text-sm ${
            state === 'success' ? 'text-[#228D7B]' : 'text-red-600'
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}

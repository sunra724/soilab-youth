'use client';

import { useState, useTransition } from 'react';

type SubmitState = 'idle' | 'success' | 'error';

export default function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setState('idle');
      setMessage('');

      const res = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState('error');
        setMessage(payload.error ?? '구독 신청을 처리하지 못했습니다.');
        return;
      }

      setState('success');
      setEmail('');
      setMessage('구독 신청이 완료되었습니다. 다음 뉴스클리핑과 기관 소식부터 보내드릴게요.');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        이메일 주소
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="email@example.com"
        required
        className="min-h-11 flex-1 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition-colors focus:border-[#46549C]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 rounded-lg px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: '#46549C' }}
      >
        {isPending ? '처리 중' : '구독 신청'}
      </button>
      {message && (
        <p
          className={`text-sm sm:basis-full ${
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

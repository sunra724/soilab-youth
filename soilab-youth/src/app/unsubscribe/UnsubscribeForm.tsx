'use client';

import { useState, useTransition } from 'react';

interface Props {
  email: string;
  token: string;
}

export default function UnsubscribeForm({ email, token }: Props) {
  const [message, setMessage] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setMessage('');

      const res = await fetch('/api/unsubscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(payload.error ?? '수신거부를 처리하지 못했습니다.');
        return;
      }

      setIsDone(true);
      setMessage('수신거부가 완료되었습니다.');
    });
  }

  if (!email || !token) {
    return (
      <p className="text-sm text-gray-500">
        수신거부 링크가 올바르지 않습니다. youth-news@soilabcoop.kr 으로 알려주시면 바로 도와드리겠습니다.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <p className="text-sm text-gray-500">
        <strong className="font-semibold text-gray-900">{email}</strong> 주소로 보내는 다시봄레터 수신을 중단합니다.
      </p>
      <button
        type="submit"
        disabled={isPending || isDone}
        className="mt-5 min-h-11 rounded-lg px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: '#46549C' }}
      >
        {isPending ? '처리 중' : isDone ? '완료됨' : '수신거부하기'}
      </button>
      {message && (
        <p className={`mt-4 text-sm ${isDone ? 'text-[#228D7B]' : 'text-red-600'}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}

'use client';

import { FormEvent, useState } from 'react';

export default function MorningEnrollForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/morning/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteCode: form.get('inviteCode'),
        nickname: form.get('nickname'),
        serviceConsent: form.get('serviceConsent') === 'on',
        privacyConsent: form.get('privacyConsent') === 'on',
        aiConsent: form.get('aiConsent') === 'on',
        retainPromises: form.get('retainPromises') === 'on',
      }),
    });
    const body = (await response.json()) as { ok: boolean; message?: string };

    if (response.ok) {
      window.location.reload();
      return;
    }

    setMessage(body.message || '참여를 시작하지 못했습니다.');
    setSubmitting(false);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
      <section className="rounded-3xl bg-[#244E40] p-7 text-white sm:p-9">
        <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#F5C95C]">
          초대받은 참여자 전용
        </span>
        <h1 className="mt-6 text-3xl font-bold leading-tight">
          다시 시작하는 아침,
          <br />
          혼자가 아니도록.
        </h1>
        <p className="mt-5 text-sm leading-7 text-white/70">
          주소나 자세한 사연을 입력하지 않아도 됩니다. 소이랩에서 받은 초대코드와 사용할 닉네임만
          준비해 주세요.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-white/75">
          <li className="flex gap-3"><span className="text-[#F5C95C]" aria-hidden="true">✓</span> 하루 한 번 아침 체크인</li>
          <li className="flex gap-3"><span className="text-[#F5C95C]" aria-hidden="true">✓</span> 선택형 일상회복 퀘스트</li>
          <li className="flex gap-3"><span className="text-[#F5C95C]" aria-hidden="true">✓</span> 담당자 연결 요청</li>
          <li className="flex gap-3"><span className="text-[#F5C95C]" aria-hidden="true">✓</span> 개인 기록과 포인트</li>
        </ul>
      </section>

      <form onSubmit={submit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-bold text-[#2F6B57]">모닝챌린지 참여 시작</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-950">최소한의 정보만 확인할게요</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">초대코드는 비밀번호와 다르며 참여 기수 확인에만 사용합니다.</p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold text-gray-700">
            초대코드
            <input
              name="inviteCode"
              required
              minLength={4}
              maxLength={32}
              autoCapitalize="characters"
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base uppercase outline-none focus:border-[#2F6B57] focus:ring-4 focus:ring-[#2F6B57]/10"
              placeholder="소이랩에서 받은 코드"
            />
          </label>
          <label className="block text-sm font-bold text-gray-700">
            사용할 닉네임
            <input
              name="nickname"
              required
              minLength={2}
              maxLength={20}
              autoComplete="nickname"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-[#2F6B57] focus:ring-4 focus:ring-[#2F6B57]/10"
              placeholder="2~20자"
            />
          </label>
        </div>

        <fieldset className="mt-8 space-y-3">
          <legend className="mb-3 text-sm font-bold text-gray-900">참여와 정보 처리 동의</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input name="serviceConsent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#2F6B57]" />
            <span>
              <strong className="block text-sm text-gray-900">[필수] 서비스 이용 및 운영규칙에 동의합니다</strong>
              <span className="mt-1 block text-xs leading-5 text-gray-500">체크인, 퀘스트, 포인트 기록 처리</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input name="privacyConsent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#2F6B57]" />
            <span>
              <strong className="block text-sm text-gray-900">[필수] 개인정보 처리에 동의합니다</strong>
              <span className="mt-1 block text-xs leading-5 text-gray-500">닉네임, 참여기록, 동의 기록을 운영 목적으로 처리</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input name="aiConsent" type="checkbox" className="mt-1 h-4 w-4 accent-[#2F6B57]" />
            <span>
              <strong className="block text-sm text-gray-900">[선택] AI 응원 생성에 동의합니다</strong>
              <span className="mt-1 block text-xs leading-5 text-gray-500">동의하지 않으면 소이랩이 승인한 고정 응원을 제공합니다.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input name="retainPromises" type="checkbox" className="mt-1 h-4 w-4 accent-[#2F6B57]" />
            <span>
              <strong className="block text-sm text-gray-900">[선택] 작은 약속과 응원 원문 저장에 동의합니다</strong>
              <span className="mt-1 block text-xs leading-5 text-gray-500">선택하지 않아도 체크인과 퀘스트에 참여할 수 있습니다.</span>
            </span>
          </label>
        </fieldset>

        <details className="mt-5 rounded-xl bg-[#F8F7F2] p-4 text-xs leading-5 text-gray-600">
          <summary className="cursor-pointer font-bold text-gray-800">동의 항목 자세히 보기</summary>
          <p className="mt-3">
            닉네임, 체크인·퀘스트·포인트·동의 기록은 프로그램 운영과 참여 기록 제공을 위해 처리합니다.
            선택한 경우에만 작은 약속을 AI 제공자에게 전송하고 원문을 일정 기간 보관합니다. 기업에는
            개인 식별정보, 약속 원문, 개인별 참여 내역, 담당자 연결 기록을 제공하지 않습니다.
            실제 참여 모집 전 소이랩이 승인한 처리방침에서 보유기간과 철회·삭제 요청 방법을 반드시 확인해 주세요.
          </p>
        </details>

        {message && (
          <p role="alert" className="mt-5 rounded-xl bg-[#FFF0EA] px-4 py-3 text-sm font-semibold text-[#A64B35]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-[#2F6B57] px-5 py-3.5 text-sm font-bold text-white enabled:hover:bg-[#245343] disabled:opacity-50"
        >
          {submitting ? '확인하고 있어요…' : '모닝챌린지 시작하기'}
        </button>
      </form>
    </div>
  );
}

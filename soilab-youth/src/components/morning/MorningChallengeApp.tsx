'use client';

import { FormEvent, useState } from 'react';
import type { MorningDashboardData } from '@/lib/morning/data';
import { MORNING_PROMISE_OPTIONS } from '@/lib/morning/core';

type Tab = 'today' | 'quests' | 'history';
type CheckinResult = { encouragement: string; safetySignal: boolean } | null;

export default function MorningChallengeApp({ initialData }: { initialData: MorningDashboardData }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>('today');
  const [promise, setPromise] = useState('');
  const [customPromise, setCustomPromise] = useState('');
  const [checkinResult, setCheckinResult] = useState<CheckinResult>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [supportRequested, setSupportRequested] = useState(
    Boolean(initialData.latestSupportRequest && ['requested', 'reviewing'].includes(initialData.latestSupportRequest.status)),
  );

  const promiseValue = promise === '직접 적기' ? customPromise : promise;
  const completedToday = new Set(
    data.completions.filter((item) => item.completed_on === data.today).map((item) => item.quest_id),
  );

  async function refreshData() {
    const response = await fetch('/api/morning/data', { cache: 'no-store' });
    const body = (await response.json()) as { ok: boolean; data?: MorningDashboardData; message?: string };
    if (response.ok && body.data) setData(body.data);
    else setMessage(body.message || '기록을 새로 불러오지 못했습니다.');
  }

  async function submitCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!promiseValue.trim()) return;
    setBusy(true);
    setMessage('');

    const response = await fetch('/api/morning/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promise: promiseValue }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      encouragement?: string;
      safetySignal?: boolean;
      message?: string;
    };

    if (response.ok && body.encouragement) {
      setCheckinResult({
        encouragement: body.encouragement,
        safetySignal: Boolean(body.safetySignal),
      });
      await refreshData();
    } else {
      setMessage(body.message || '체크인을 기록하지 못했습니다.');
    }
    setBusy(false);
  }

  async function completeQuest(questId: string) {
    setBusy(true);
    setMessage('');
    const response = await fetch(`/api/morning/quests/${questId}/complete`, { method: 'POST' });
    const body = (await response.json()) as { ok: boolean; message?: string };
    if (response.ok) await refreshData();
    else setMessage(body.message || '활동을 기록하지 못했습니다.');
    setBusy(false);
  }

  async function requestSupport() {
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/morning/support', { method: 'POST' });
    const body = (await response.json()) as { ok: boolean; message?: string };
    if (response.ok) {
      setSupportRequested(true);
      await refreshData();
    } else {
      setMessage(body.message || '연결 요청을 접수하지 못했습니다.');
    }
    setBusy(false);
  }

  async function logout() {
    await fetch('/api/morning/logout', { method: 'POST' });
    window.location.reload();
  }

  async function withdraw() {
    const confirmed = window.confirm(
      '참여를 종료할까요? 저장된 약속·응원 원문과 닉네임은 삭제되고 다시 로그인할 수 없습니다.',
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage('');
    const response = await fetch('/api/morning/withdraw', { method: 'POST' });
    const body = (await response.json()) as { ok: boolean; message?: string };
    if (response.ok) {
      window.location.reload();
      return;
    }
    setMessage(body.message || '참여 종료 요청을 처리하지 못했습니다.');
    setBusy(false);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-[#FBFAF6] px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5C95C] text-xl" aria-hidden="true">☀</span>
            <div>
              <p className="font-bold text-gray-950">{data.nickname}님의 모닝챌린지</p>
              <p className="text-xs text-gray-400">{data.today} · 포인트 {data.points.toLocaleString('ko-KR')}P</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="text-xs font-bold text-gray-400 hover:text-gray-700">
            안전하게 나가기
          </button>
        </header>

        <nav className="grid grid-cols-3 border-b border-gray-100" aria-label="모닝챌린지 메뉴">
          {([
            ['today', '오늘'],
            ['quests', '퀘스트'],
            ['history', '나의 기록'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={tab === key ? 'page' : undefined}
              className={`border-b-2 px-3 py-4 text-sm font-bold ${
                tab === key ? 'border-[#2F6B57] text-[#2F6B57]' : 'border-transparent text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="min-h-[560px] p-5 sm:p-8">
          {tab === 'today' && (
            <div>
              {!data.todayCheckin && !checkinResult ? (
                <form onSubmit={submitCheckin}>
                  <p className="text-sm font-bold text-[#2F6B57]">좋은 아침이에요.</p>
                  <h1 className="mt-3 text-2xl font-bold leading-snug text-gray-950 sm:text-3xl">
                    오늘 여기까지 와준 것만으로도
                    <br />
                    충분히 좋은 시작이에요.
                  </h1>
                  <p className="mt-4 text-sm leading-6 text-gray-600">지금 가능한 작은 약속을 하나 골라볼까요?</p>
                  <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[...MORNING_PROMISE_OPTIONS, '직접 적기'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={promise === item}
                        onClick={() => setPromise(item)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                          promise === item
                            ? 'border-[#2F6B57] bg-[#EAF4EE] text-[#2F6B57]'
                            : 'border-gray-200 text-gray-700 hover:border-[#2F6B57]/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {promise === '직접 적기' && (
                    <div className="mt-5">
                      <label htmlFor="morning-custom-promise" className="mb-2 block text-sm font-bold text-gray-700">
                        오늘 가능한 만큼만 적어 주세요
                      </label>
                      <input
                        id="morning-custom-promise"
                        value={customPromise}
                        onChange={(event) => setCustomPromise(event.target.value)}
                        maxLength={60}
                        autoComplete="off"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-[#2F6B57] focus:ring-4 focus:ring-[#2F6B57]/10"
                        placeholder="예: 양치하고 창가에 앉아 있기"
                      />
                      <p className="mt-2 text-xs text-gray-400">개인정보나 자세한 사연은 적지 않아도 됩니다.</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!promiseValue.trim() || busy}
                    className="mt-7 w-full rounded-xl bg-[#2F6B57] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-40"
                  >
                    {busy ? '기록하고 있어요…' : '오늘의 약속 기록하기'}
                  </button>
                </form>
              ) : (
                <div aria-live="polite">
                  <span className="inline-flex rounded-full bg-[#EAF4EE] px-3 py-1.5 text-xs font-bold text-[#2F6B57]">
                    오늘 체크인 완료
                  </span>
                  <h1 className="mt-5 text-2xl font-bold text-gray-950">오늘의 시작을 기록했어요</h1>
                  {(checkinResult?.encouragement || data.todayCheckin?.encouragement) && (
                    <div className={`mt-6 rounded-2xl p-6 ${
                      checkinResult?.safetySignal || data.todayCheckin?.safety_signal ? 'bg-[#FFF0EA]' : 'bg-[#FFF8DF]'
                    }`}>
                      <p className="text-[17px] font-bold leading-8 text-gray-800">
                        {checkinResult?.encouragement || data.todayCheckin?.encouragement}
                      </p>
                    </div>
                  )}
                  {!data.retainPromises && !checkinResult && (
                    <p className="mt-5 rounded-xl bg-[#F8F7F2] p-4 text-sm leading-6 text-gray-600">
                      원문 저장에 동의하지 않아 오늘의 약속과 응원 내용은 보관하지 않았습니다.
                    </p>
                  )}
                  {(checkinResult?.safetySignal || data.todayCheckin?.safety_signal) && (
                    <button
                      type="button"
                      onClick={requestSupport}
                      disabled={busy || supportRequested}
                      className="mt-5 w-full rounded-xl bg-[#A64B35] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {supportRequested ? '담당자 연결 요청 접수됨' : '소이랩 담당자에게 연결 요청'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTab('quests')}
                    className="mt-5 w-full rounded-xl border border-[#2F6B57] px-5 py-3.5 text-sm font-bold text-[#2F6B57]"
                  >
                    오늘의 다음 퀘스트 보기
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'quests' && (
            <div>
              <p className="text-sm font-bold text-[#2F6B57]">나의 다음 걸음</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-950">오늘 가능한 활동을 골라요</h1>
              <p className="mt-3 text-sm leading-6 text-gray-600">쉬운 활동을 반복하거나 오늘은 쉬어가도 괜찮습니다.</p>
              <div className="mt-7 space-y-3">
                {data.quests.map((quest) => {
                  const done = completedToday.has(quest.id);
                  return (
                    <article key={quest.id} className={`rounded-2xl border p-5 ${done ? 'border-[#2F6B57] bg-[#EAF4EE]' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400">{quest.category}</span>
                          <h2 className="mt-2 font-bold text-gray-900">{quest.title}</h2>
                          <p className="mt-2 text-sm leading-6 text-gray-500">{quest.description}</p>
                          <p className="mt-3 text-xs font-bold text-[#2F6B57]">
                            {quest.estimated_minutes === 0 ? '부담 없음' : `${quest.estimated_minutes}분`}
                            {quest.reward_points > 0 ? ` · ${quest.reward_points}P` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={done || busy}
                          onClick={() => completeQuest(quest.id)}
                          className="shrink-0 rounded-xl bg-[#2F6B57] px-4 py-2 text-xs font-bold text-white disabled:bg-gray-300"
                        >
                          {done ? '완료' : '기록'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div>
              <p className="text-sm font-bold text-[#2F6B57]">나의 기록</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-950">다시 시작한 날들이 모이고 있어요</h1>
              <dl className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F8F7F2] p-5">
                  <dt className="text-xs font-bold text-gray-400">누적 체크인</dt>
                  <dd className="mt-2 text-2xl font-bold text-gray-900">{data.totalCheckins}일</dd>
                </div>
                <div className="rounded-2xl bg-[#F8F7F2] p-5">
                  <dt className="text-xs font-bold text-gray-400">완료 퀘스트</dt>
                  <dd className="mt-2 text-2xl font-bold text-gray-900">{data.totalCompletions}개</dd>
                </div>
              </dl>
              <div className="mt-6 space-y-2">
                {data.checkins.length > 0 ? data.checkins.map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">{checkin.checked_on}</span>
                    <span className="text-xs font-bold text-[#2F6B57]">체크인 완료</span>
                  </div>
                )) : (
                  <p className="rounded-xl bg-[#F8F7F2] p-5 text-sm text-gray-500">첫 체크인을 기다리고 있어요.</p>
                )}
              </div>
            </div>
          )}

          {message && (
            <p role="alert" className="mt-6 rounded-xl bg-[#FFF0EA] px-4 py-3 text-sm font-semibold text-[#A64B35]">
              {message}
            </p>
          )}
        </div>
      </section>

      <aside className="space-y-4" aria-label="내 참여 정보">
        <section className="rounded-2xl bg-[#244E40] p-6 text-white">
          <p className="text-xs font-bold text-[#F5C95C]">MY MORNING</p>
          <p className="mt-3 text-3xl font-bold">{data.points.toLocaleString('ko-KR')}P</p>
          <p className="mt-2 text-sm text-white/60">활동으로 모은 포인트</p>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-bold text-gray-900">내 정보 보호 설정</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
            <li>AI 응원: <strong>{data.aiConsent ? '동의함' : '사용하지 않음'}</strong></li>
            <li>약속 원문 저장: <strong>{data.retainPromises ? '동의함' : '저장하지 않음'}</strong></li>
          </ul>
          <details className="mt-5 border-t border-gray-100 pt-4">
            <summary className="cursor-pointer text-xs font-bold text-gray-500">동의 철회 및 참여 종료</summary>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              참여를 종료하면 닉네임과 저장된 약속·응원 원문을 삭제하고 세션을 종료합니다.
              회계·감사에 필요한 개인 식별 없는 활동 집계는 운영 정책에 따라 보존될 수 있습니다.
            </p>
            <button
              type="button"
              onClick={withdraw}
              disabled={busy}
              className="mt-3 text-xs font-bold text-[#A64B35] underline underline-offset-4 disabled:opacity-50"
            >
              참여 종료하기
            </button>
          </details>
        </section>
        <section className="rounded-2xl border border-[#EBCABD] bg-[#FFF8F5] p-6">
          <h2 className="font-bold text-gray-900">담당자와 이야기하고 싶나요?</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">요청 내용의 원문 없이 연결 요청 사실만 소이랩 담당자에게 전달합니다.</p>
          <button
            type="button"
            onClick={requestSupport}
            disabled={busy || supportRequested}
            className="mt-4 w-full rounded-xl border border-[#A64B35] px-4 py-3 text-sm font-bold text-[#A64B35] disabled:opacity-50"
          >
            {supportRequested ? '연결 요청 접수됨' : '담당자 연결 요청'}
          </button>
        </section>
      </aside>
    </div>
  );
}

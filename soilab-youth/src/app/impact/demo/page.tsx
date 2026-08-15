import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { impactDemo } from '@/data/csr';

export const metadata: Metadata = {
  title: '모닝챌린지 CSR 성과 데모',
  description: '기업 파트너가 확인할 수 있는 익명·집계 사회성과와 예산 배분 화면의 공개 데모입니다.',
  robots: { index: false, follow: true },
};

const numberFormat = new Intl.NumberFormat('ko-KR');

export default function ImpactDemoPage() {
  const maxWeekly = Math.max(...impactDemo.weeklyParticipation);
  const budgetGradient = `conic-gradient(${impactDemo.budget
    .reduce<{ stops: string[]; total: number }>(
      (acc, item) => {
        const start = acc.total;
        const end = start + item.ratio;
        acc.stops.push(`${item.color} ${start}% ${end}%`);
        acc.total = end;
        return acc;
      },
      { stops: [], total: 0 },
    )
    .stops.join(', ')})`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F4F6F2] text-gray-900">
        <section className="border-b border-gray-200 bg-[#244E40] text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <Link
                  href="/csr/morning-challenge"
                  className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#F5C95C] hover:underline"
                >
                  <span aria-hidden="true">←</span> 모닝챌린지 소개
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#F5C95C] px-3 py-1.5 text-xs font-bold text-[#244E40]">
                    데모 데이터
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/75">
                    기업 CSR 성과 화면 예시
                  </span>
                </div>
                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{impactDemo.projectName}</h1>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  고립·은둔청년의 개인정보를 제외한 집계 정보만 표시하는 구조입니다.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-white/45">프로그램 기간</dt>
                  <dd className="mt-1 font-bold">{impactDemo.period} 시범사업안</dd>
                </div>
                <div>
                  <dt className="text-white/45">업데이트</dt>
                  <dd className="mt-1 font-bold">데모 기준일</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-8 rounded-2xl border border-[#D9C77D] bg-[#FFF8DF] px-5 py-4 text-sm leading-6 text-[#615321]">
            <strong>중요:</strong> 아래 수치는 서비스 시연을 위해 만든 예시이며 실제 참여자, 후원기업,
            집행 실적이 아닙니다.
          </div>

          <section aria-labelledby="summary-title">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="summary-title" className="text-lg font-bold text-gray-950">핵심 참여 현황</h2>
              <span className="text-xs font-bold text-[#2F6B57]">모든 카드: 데모 데이터</span>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ['목표 참여 인원', `${impactDemo.targetParticipants}명`, '시범사업 목표'],
                ['활성 참여 인원', `${impactDemo.activeParticipants}명`, '8주 누적 예시'],
                ['누적 체크인', `${numberFormat.format(impactDemo.totalCheckins)}회`, '중복 유효 체크인 제외'],
                ['완료 퀘스트', `${numberFormat.format(impactDemo.completedQuests)}회`, '5개 카테고리 합계'],
                ['지역 카페 이용', `${numberFormat.format(impactDemo.localUses)}회`, '지역상생 예시'],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <dt className="text-xs font-bold text-gray-400">{label}</dt>
                  <dd className="mt-3 text-2xl font-bold text-gray-950">{value}</dd>
                  <p className="mt-2 text-xs text-gray-400">{note}</p>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="weekly-title">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 id="weekly-title" className="text-lg font-bold text-gray-950">주간 참여율</h2>
                  <p className="mt-1 text-sm text-gray-500">프로그램 참여 흐름을 보는 데모 그래프</p>
                </div>
                <span className="rounded-full bg-[#EAF4EE] px-3 py-1.5 text-xs font-bold text-[#2F6B57]">
                  최근 주 84% 예시
                </span>
              </div>
              <div
                className="mt-8 flex h-64 items-end gap-2 border-b border-gray-200 sm:gap-4"
                role="img"
                aria-label={`1주차부터 8주차까지 참여율 ${impactDemo.weeklyParticipation.join(', ')}퍼센트`}
              >
                {impactDemo.weeklyParticipation.map((value, index) => (
                  <div key={`${index}-${value}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <span className="text-center text-[11px] font-bold text-gray-500">{value}%</span>
                    <div
                      className="min-h-3 rounded-t-lg bg-[#2F6B57] transition-[height]"
                      style={{ height: `${(value / maxWeekly) * 82}%`, opacity: 0.5 + index * 0.06 }}
                    />
                    <span className="pb-2 text-center text-[10px] text-gray-400">{index + 1}주</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="quest-title">
              <h2 id="quest-title" className="text-lg font-bold text-gray-950">퀘스트 구성</h2>
              <p className="mt-1 text-sm text-gray-500">완료 활동 카테고리 비율 예시</p>
              <div className="mt-7 space-y-5">
                {impactDemo.questMix.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.value}%</span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-gray-100"
                      role="progressbar"
                      aria-label={`${item.label} ${item.value}%`}
                      aria-valuenow={item.value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="journey-title">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 id="journey-title" className="text-lg font-bold text-gray-950">회복 여정 흐름</h2>
                  <p className="mt-1 text-sm text-gray-500">첫 활동에서 지역연결까지의 집계 예시</p>
                </div>
                <span className="text-xs font-bold text-[#2F6B57]">데모 데이터</span>
              </div>
              <div className="mt-8 space-y-3">
                {impactDemo.journey.map((stage, index) => (
                  <div
                    key={stage.label}
                    className="flex items-center justify-between rounded-2xl px-5 py-4"
                    style={{
                      width: `${100 - index * 14}%`,
                      background: index === 0 ? '#EAF4EE' : index === 1 ? '#EEF5F7' : '#FFF0EA',
                    }}
                  >
                    <span className="text-sm font-bold text-gray-800">{stage.label}</span>
                    <span className="text-sm font-bold text-gray-600">{stage.value}명</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-5 text-gray-400">
                개인별 이동 경로나 심리 상태는 기업 화면에 표시하지 않습니다.
              </p>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="budget-title">
              <div>
                <h2 id="budget-title" className="text-lg font-bold text-gray-950">사업비 배분안</h2>
                <p className="mt-1 text-sm text-gray-500">총 20,000,000원 시범사업 예시</p>
              </div>
              <div className="mt-7 grid grid-cols-1 items-center gap-7 sm:grid-cols-[180px_1fr]">
                <div
                  className="mx-auto flex h-44 w-44 items-center justify-center rounded-full"
                  style={{ background: budgetGradient }}
                  role="img"
                  aria-label={impactDemo.budget.map((item) => `${item.label} ${item.ratio}%`).join(', ')}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-xs text-gray-400">예산안</span>
                    <strong className="mt-1 text-lg text-gray-900">2천만원</strong>
                  </div>
                </div>
                <ul className="space-y-3">
                  {impactDemo.budget.map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} aria-hidden="true" />
                        {item.label}
                      </span>
                      <span className="font-bold text-gray-900">{item.ratio}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-3xl bg-[#244E40] p-6 text-white sm:p-8" aria-labelledby="privacy-title">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs font-bold text-[#F5C95C]">PRIVACY BY DESIGN</p>
                <h2 id="privacy-title" className="mt-3 text-2xl font-bold">보이지 않게 하는 것도 중요한 성과입니다</h2>
                <p className="mt-4 text-sm leading-6 text-white/65">
                  참여자가 안심하고 회복할 수 있도록 기업 화면에서 개인을 추정할 수 있는 정보를 숨깁니다.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  '이름·연락처·식별자 비공개',
                  '작은 약속·AI 대화 원문 비공개',
                  '상담·연결 기록 비공개',
                  '5명 미만 소수 집단 통계 숨김',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-4 text-sm font-semibold">
                    <span className="text-[#F5C95C]" aria-hidden="true">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Link
              href="/morning"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700"
            >
              참여자 체험 화면
            </Link>
            <a
              href="mailto:soilabcoop@gmail.com?subject=%5B%EB%AA%A8%EB%8B%9D%EC%B1%8C%EB%A6%B0%EC%A7%80%20CSR%20%EB%AC%B8%EC%9D%98%5D"
              className="rounded-xl bg-[#2F6B57] px-5 py-3 text-sm font-bold text-white"
            >
              기업 파트너십 문의
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

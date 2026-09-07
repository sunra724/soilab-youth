import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { morningQuestCategories } from '@/data/csr';

export const metadata: Metadata = {
  title: '모닝챌린지 CSR',
  description:
    '다시 시작하는 아침, 혼자가 아니도록. 고립·은둔청년의 작은 일상 회복을 기업과 지역사회가 함께 지원하는 CSR 프로그램입니다.',
  alternates: { canonical: 'https://csr.soilab-youth.kr/morning-challenge' },
  openGraph: {
    title: '다시 시작하는 아침, 혼자가 아니도록 | 모닝챌린지',
    description: '고립·은둔청년의 작은 일상 회복을 기업과 지역사회가 함께 지원하는 CSR 프로그램',
    url: 'https://csr.soilab-youth.kr/morning-challenge',
  },
};

const journey = [
  ['01', '초대코드로 시작해요', '소이랩이 발급한 초대코드와 별명으로 안전하게 시작합니다.'],
  ['02', '작은 약속을 골라요', '물 한 잔, 커튼 열기처럼 오늘 가능한 만큼만 선택합니다.'],
  ['03', '응원과 퀘스트를 만나요', '비교하거나 재촉하지 않는 응원과 다음 걸음 선택지를 확인합니다.'],
  ['04', '지역과 천천히 연결돼요', '포인트·쿠폰과 안전한 지역 활동으로 이어질 수 있습니다.'],
];

const protectionPrinciples = [
  {
    title: '사진·위치 인증은 선택',
    description: '권한을 거부해도 자기확인 등 대체 방식으로 참여할 수 있게 설계합니다.',
  },
  {
    title: '마음 활동은 진단이 아님',
    description: 'AI가 상담·진단·치료를 하지 않으며 참여자의 감정을 기업에 제공하지 않습니다.',
  },
  {
    title: '기업에는 익명 집계만',
    description: '이름, 연락처, 작은 약속 원문, 개인 출석 내역을 기업이 볼 수 없습니다.',
  },
  {
    title: '놓친 날에도 다시 시작',
    description: '실패, 순위, 공개 리더보드 없이 휴식과 다시 시작을 자연스럽게 지원합니다.',
  },
];

export default function MorningChallengePage() {
  return (
    <>
      <Header />
      <main className="bg-[#FFFDF7] text-gray-900">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-[8%] top-16 h-20 w-20 rounded-full bg-[#F5C95C]" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#CFE5D8]" />
          <div className="relative mx-auto grid min-h-[690px] max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.82fr]">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#2F6B57] px-3 py-1.5 text-xs font-bold text-white">참여 서비스 운영형</span>
                <span className="rounded-full bg-[#FFF1BC] px-3 py-1.5 text-xs font-bold text-[#765E09]">
                  8주 모닝 루틴
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-6xl">
                다시 시작하는 아침,
                <br />
                <span className="text-[#2F6B57]">혼자가 아니도록.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                모닝챌린지는 고립·은둔청년이 작은 일상을 회복하고 지역사회와 연결되도록
                기업과 지역사회가 함께 지원하는 디지털 기반 사회공헌 프로그램입니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/morning"
                  className="rounded-xl bg-[#2F6B57] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#245343]"
                >
                  모닝챌린지 참여하기
                </Link>
                <Link
                  href="/impact/demo"
                  className="rounded-xl border border-[#2F6B57]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#2F6B57] hover:border-[#2F6B57]"
                >
                  기업 성과 화면 보기
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-gray-400">
                초대코드와 별명으로 참여하며, 약속 원문 저장과 AI 응원 사용 여부를 직접 선택할 수 있습니다.
              </p>
            </div>

            <div className="mx-auto w-full max-w-sm">
              <div className="rounded-[2.5rem] border-[10px] border-[#244E40] bg-white p-4 shadow-[0_30px_80px_rgba(35,68,57,0.24)]">
                <div className="rounded-[1.75rem] bg-[#F4F0E5] p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>좋은 아침이에요</span>
                    <span>08:10</span>
                  </div>
                  <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5C95C] text-3xl" aria-hidden="true">
                    ☀
                  </div>
                  <p className="mt-6 text-xl font-bold leading-snug text-gray-900">
                    오늘 여기까지 와준 것만으로도 충분히 좋은 시작이에요.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">오늘 가능한 작은 약속을 하나 골라볼까요?</p>
                  <div className="mt-5 space-y-2">
                    {['물 한 잔 마시기', '창문 열고 숨 쉬기', '직접 적기'].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                          index === 0
                            ? 'border-[#2F6B57] bg-[#EAF4EE] text-[#2F6B57]'
                            : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-16 z-30 border-y border-gray-200 bg-white/95 backdrop-blur" aria-label="모닝챌린지 페이지 내 탐색">
          <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-4 text-sm font-semibold text-gray-600 sm:px-6">
            <a href="#how" className="shrink-0 hover:text-[#2F6B57]">이용 방법</a>
            <a href="#quests" className="shrink-0 hover:text-[#2F6B57]">회복 퀘스트</a>
            <a href="#csr-structure" className="shrink-0 hover:text-[#2F6B57]">후원 구조</a>
            <a href="#protection" className="shrink-0 hover:text-[#2F6B57]">참여자 보호</a>
          </div>
        </nav>

        <section id="how" className="scroll-mt-36 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold text-[#2F6B57]">A GENTLE START</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                거창한 목표 대신
                <br />
                오늘 가능한 한 가지
              </h2>
            </div>
            <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
              {journey.map(([number, title, description]) => (
                <li key={number} className="relative rounded-2xl border border-gray-200 bg-white p-6">
                  <span className="text-sm font-bold text-[#E0A72F]">{number}</span>
                  <h3 className="mt-8 font-bold text-gray-900">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="quests" className="scroll-mt-36 bg-[#F4F0E5] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="mb-3 text-sm font-bold text-[#C4694F]">RECOVERY QUESTS</p>
                <h2 className="text-3xl font-bold tracking-tight text-gray-950">나의 다음 걸음을 직접 고릅니다</h2>
                <p className="mt-5 text-[15px] leading-7 text-gray-600">
                  레벨과 순위 대신 씨앗, 새싹, 한걸음처럼 회복 중심의 표현을 사용합니다.
                  쉬운 활동을 반복하거나 건너뛰고 쉬어도 괜찮습니다.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {morningQuestCategories.map((category, index) => (
                  <article
                    key={category.key}
                    className={`rounded-2xl border border-white/80 p-6 shadow-sm ${index === 4 ? 'sm:col-span-2' : ''}`}
                    style={{ background: category.softColor }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{category.title}</h3>
                      <span className="h-3 w-3 rounded-full" style={{ background: category.color }} aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{category.description}</p>
                    <p className="mt-5 text-xs font-medium text-gray-500">{category.examples.join(' · ')}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="csr-structure" className="scroll-mt-36 bg-[#244E40] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm font-bold text-[#F5C95C]">CSR PARTNERSHIP</p>
                <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  후원은 활동지원과
                  <br />
                  지역의 연결이 됩니다
                </h2>
                <p className="mt-5 text-[15px] leading-7 text-white/70">
                  기업의 사회공헌기금은 청년 활동지원, 프로그램 운영, 지역 카페 연계,
                  안전한 지원체계를 만드는 데 사용하도록 설계합니다.
                </p>
                <Link
                  href="/impact/demo"
                  className="mt-7 inline-flex rounded-xl bg-[#F5C95C] px-5 py-3 text-sm font-bold text-[#244E40]"
                >
                  익명 성과 대시보드 보기
                </Link>
              </div>
              <div className="rounded-3xl bg-white/8 p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    ['청년 활동지원', '포인트·쿠폰·선택형 활동'],
                    ['프로그램 운영', '담당자 지원·퀘스트 운영'],
                    ['지역상생', '협약 카페·소상공인 연계'],
                    ['성과·안전관리', '익명 집계·증빙·보호체계'],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl bg-white/10 p-5">
                      <h3 className="font-bold text-white">{title}</h3>
                      <p className="mt-2 text-sm text-white/60">{description}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-white/50">
                  지정기탁 방식과 예산 항목은 관계기관·후원기업 협의 후 확정합니다. 이 페이지에서 후원금을 결제받지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="protection" className="scroll-mt-36 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-3 text-sm font-bold text-[#2F6B57]">SAFE BY DESIGN</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950">참여자의 안전과 선택을 먼저 지킵니다</h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-gray-600">
                모닝챌린지는 상담·진단 서비스가 아닙니다. 참여자는 개인정보·AI 활용에 각각 동의하고,
                담당자 연결을 직접 요청할 수 있으며 보유기간이 지난 선택 기록은 자동 삭제합니다.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {protectionPrinciples.map((principle) => (
                <article key={principle.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EE] font-bold text-[#2F6B57]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900">{principle.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{principle.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">작은 아침을 함께 지원해 주세요</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                기업·기관의 사회공헌 목표에 맞춘 시범사업을 함께 설계합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:soilabcoop@gmail.com?subject=%5B%EB%AA%A8%EB%8B%9D%EC%B1%8C%EB%A6%B0%EC%A7%80%20CSR%20%EB%AC%B8%EC%9D%98%5D"
                className="rounded-xl bg-[#2F6B57] px-5 py-3 text-sm font-bold text-white"
              >
                파트너십 문의
              </a>
              <Link href="/csr" className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700">
                다른 CSR 프로그램
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

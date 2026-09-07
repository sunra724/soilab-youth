import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CsrProgramGrid from '@/components/csr/CsrProgramGrid';
import { csrPrograms } from '@/data/csr';

export const metadata: Metadata = {
  title: 'CSR 기업사회공헌',
  description:
    '고립·은둔청년의 일상회복과 지역 연결을 돕는 협동조합 소이랩의 기업사회공헌 제안 프로그램입니다.',
  alternates: { canonical: 'https://csr.soilab-youth.kr' },
  openGraph: {
    title: '청년의 다음 걸음을 함께 만드는 CSR | 협동조합 소이랩',
    description:
      '모닝챌린지를 비롯한 고립·은둔청년 일상회복, 지역상생, 사회참여 CSR 제안 프로그램을 확인하세요.',
    url: 'https://csr.soilab-youth.kr',
  },
};

const partnershipSteps = [
  {
    number: '01',
    title: '기업의 목표를 듣습니다',
    description: '예산, 임직원 참여 여부, 지역과 기간을 확인하고 사회공헌 목표를 함께 정리합니다.',
  },
  {
    number: '02',
    title: '청년에게 맞게 설계합니다',
    description: '참여 문턱과 개인정보 노출을 낮추고, 소이랩 현장 경험을 바탕으로 활동을 구성합니다.',
  },
  {
    number: '03',
    title: '안전하게 운영합니다',
    description: '소이랩 담당자가 참여 흐름과 연결 요청을 살피며 지역 기관·상점과 협력합니다.',
  },
  {
    number: '04',
    title: '익명 성과로 보고합니다',
    description: '개인 사연 대신 참여, 활동, 지역상생, 예산 집행을 집계해 투명하게 공유합니다.',
  },
];

export default function CsrPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FBFAF6] text-gray-900">
        <section className="relative overflow-hidden border-b border-black/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_15%,rgba(239,192,79,0.38),transparent_28%),radial-gradient(circle_at_14%_82%,rgba(47,107,87,0.18),transparent_30%)]" />
          <div className="relative mx-auto grid min-h-[620px] max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <span className="mb-5 inline-flex rounded-full border border-[#2F6B57]/20 bg-white/70 px-3 py-1.5 text-xs font-bold text-[#2F6B57]">
                SOILAB CSR PROGRAMS
              </span>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.16] tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-6xl">
                청년의 다음 걸음을
                <br />
                <span className="text-[#2F6B57]">기업과 함께</span> 만듭니다
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
                협동조합 소이랩은 고립·은둔청년이 자신의 속도로 일상을 회복하도록 돕고,
                기업에는 개인정보를 제외한 사회성과와 집행 결과를 전합니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#programs"
                  className="rounded-xl bg-[#2F6B57] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#245343]"
                >
                  제안 프로그램 보기
                </a>
                <a
                  href="mailto:soilabcoop@gmail.com?subject=%5BCSR%20%ED%8C%8C%ED%8A%B8%EB%84%88%EC%8B%AD%20%EB%AC%B8%EC%9D%98%5D"
                  className="rounded-xl border border-gray-300 bg-white/70 px-5 py-3 text-sm font-bold text-gray-800 transition-colors hover:border-[#2F6B57] hover:text-[#2F6B57]"
                >
                  기업 파트너십 문의
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rotate-3 rounded-[2.25rem] bg-[#F3C85A]" aria-hidden="true" />
              <div className="relative rounded-[2rem] bg-[#244E40] p-7 text-white shadow-[0_28px_80px_rgba(35,68,57,0.28)] sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">소이랩의 약속</span>
                  <span className="text-2xl" aria-hidden="true">☀</span>
                </div>
                <p className="mt-12 text-2xl font-bold leading-snug">
                  성과보다 먼저,
                  <br />
                  참여자의 안전과 선택을
                  <br />
                  지킵니다.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <span className="block text-2xl font-bold text-[#F5C95C]">4</span>
                    <span className="mt-1 block text-white/70">CSR 제안 프로그램</span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <span className="block text-2xl font-bold text-[#F5C95C]">100%</span>
                    <span className="mt-1 block text-white/70">익명·집계 성과 원칙</span>
                  </div>
                </div>
                <p className="mt-5 text-xs leading-5 text-white/55">
                  프로그램 수는 현재 홈페이지에 공개한 제안안 기준입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 text-sm font-bold text-[#2F6B57]">CSR PROGRAM PORTFOLIO</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">함께 만들 수 있는 프로그램</h2>
              <p className="mt-4 text-[15px] leading-7 text-gray-600">
                모닝챌린지는 초대코드 기반 참여 서비스로 운영할 수 있습니다. 나머지 프로그램은 기업의 목표와 지역,
                예산에 따라 구체화하는 제안안이며 실제 운영 사업이나 확정 성과로 표시하지 않습니다.
              </p>
            </div>
            <CsrProgramGrid programs={csrPrograms} />
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24" aria-labelledby="csr-principles">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="mb-3 text-sm font-bold text-[#C4694F]">PARTNERSHIP PRINCIPLES</p>
                <h2 id="csr-principles" className="text-3xl font-bold leading-tight tracking-tight text-gray-950">
                  후원이 청년에게
                  <br />
                  닿는 네 가지 기준
                </h2>
                <p className="mt-5 text-[15px] leading-7 text-gray-600">
                  소이랩은 청년의 얼굴이나 사연을 성과로 소비하지 않습니다. 안전한 참여 경험과
                  투명한 집행 구조를 함께 설계합니다.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-gray-200 sm:grid-cols-2">
                {[
                  ['낮은 참여 문턱', '초대코드와 별명만으로 작은 선택부터 시작합니다.'],
                  ['최소 정보 수집', '이름과 대화 원문 대신 필요한 정보만 다룹니다.'],
                  ['지역 안의 연결', '쿠폰과 활동을 지역 카페·공간·지원기관과 잇습니다.'],
                  ['익명 성과 보고', '기업은 집계 지표와 집행 결과만 확인합니다.'],
                ].map(([title, description], index) => (
                  <div key={title} className="bg-[#FBFAF6] p-7">
                    <span className="text-xs font-bold text-gray-300">0{index + 1}</span>
                    <h3 className="mt-5 font-bold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24" aria-labelledby="partnership-process">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-3 text-sm font-bold text-[#2F6B57]">HOW WE PARTNER</p>
              <h2 id="partnership-process" className="text-3xl font-bold tracking-tight text-gray-950">
                문의부터 성과보고까지
              </h2>
            </div>
            <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
              {partnershipSteps.map((step) => (
                <li key={step.number} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <span className="text-sm font-bold text-[#E0A72F]">{step.number}</span>
                  <h3 className="mt-5 font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{step.description}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl border border-[#D7C98D] bg-[#FFF8DE] p-5 text-sm leading-6 text-[#615321]">
              <strong>행정 절차 안내</strong>
              <span className="ml-2">
                지정기탁 방식과 기부금영수증 발급 주체는 관계기관 협의 후 확정합니다. 현재 화면은
                온라인 기부금 결제 페이지가 아닙니다.
              </span>
            </div>
          </div>
        </section>

        <section className="bg-[#244E40] py-16 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#F5C95C]">START A CONVERSATION</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">우리 기업에 맞는 CSR 프로그램을 함께 찾습니다</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                053-941-9003 · soilabcoop@gmail.com
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:soilabcoop@gmail.com?subject=%5BCSR%20%ED%8C%8C%ED%8A%B8%EB%84%88%EC%8B%AD%20%EB%AC%B8%EC%9D%98%5D"
                className="rounded-xl bg-[#F5C95C] px-5 py-3 text-sm font-bold text-[#244E40]"
              >
                이메일로 문의하기
              </a>
              <Link
                href="/impact/demo"
                className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                성과 화면 미리보기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

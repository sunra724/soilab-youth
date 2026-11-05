import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { youthBusinessInquiryHref } from '@/data/institution-inquiry';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  path: '/partnership',
  title: '기관 협력 | 청년지원 사업 기획·운영',
  description: '지자체·청년센터·복지기관과 함께하는 소이랩의 청년지원 사업 수행 범위, 역할 분담, 결과물과 협의 절차를 안내합니다.',
});

const scopes = [
  {
    title: '참여를 시작하는 과정',
    need: '사업을 소개해도 첫 만남이나 활동 참여로 이어지기 어려울 때',
    work: '대상과 접촉 경로를 살펴보고, 사전 대화와 부담이 적은 첫 활동의 흐름을 구성합니다. 추천 기관과 참여 안내 방식도 함께 정합니다.',
    outputs: '참여 안내 · 초기 참여 흐름 · 운영 기록',
  },
  {
    title: '일상회복과 관계 활동',
    need: '청년의 상황과 속도에 맞는 활동 운영이 필요할 때',
    work: '개인별 목표를 바탕으로 일상 활동, 소모임, 진로 탐색 등을 구성합니다. 참여 과정에서 확인한 어려움과 필요한 조정을 기록합니다.',
    outputs: '활동 운영안 · 회차별 기록 · 참여 현황',
  },
  {
    title: '가족·생활권의 지원 연결',
    need: '기관 안의 프로그램을 가족과 지역의 일상으로 연결하고 싶을 때',
    work: '가족지원 활동과 지역 자원 연계를 협의합니다. 가족과 함께 지원 도구를 만들고 시험하는 리빙랩 방식도 도입안으로 검토할 수 있습니다.',
    outputs: '지역 자원 목록 · 연계 현황 · 가족지원 활동 기록',
  },
  {
    title: '운영 결과와 다음 연결',
    need: '출석 집계와 함께 참여 과정, 변화와 남은 과제를 정리해야 할 때',
    work: '참여·이수·외부 자원 연계를 구분해 정리합니다. 합의한 지표에 따라 변화와 한계를 확인하고, 종료 시 필요한 인계와 후속 점검 범위를 정합니다.',
    outputs: '지표 정의 · 익명 집계 · 결과보고 · 인계·점검 계획',
  },
];

const steps = [
  { title: '사업 상황 공유', description: '운영 지역, 대상, 현재 단계, 희망 일정과 예산 범위를 확인합니다.' },
  { title: '역할과 범위 합의', description: '기관과 소이랩의 업무, 투입 인력, 활동 횟수, 결과물과 점검 기간을 정합니다.' },
  { title: '운영과 중간 점검', description: '합의한 계획에 따라 운영하고 참여 현황과 현장 이슈를 담당자와 확인합니다.' },
  { title: '결과 정리와 인계', description: '결과와 개선 과제를 보고하고, 후속 지원에 필요한 연결과 인계를 마무리합니다.' },
];

const faqs = [
  {
    question: '청년미래센터 등 공공 지원기관과는 어떻게 협력하나요?',
    answer: '기관의 기존 업무와 필요한 보완 영역부터 확인합니다. 기관이 대상자 선정·사례관리·지원 결정 등을 맡고, 소이랩이 합의한 활동 운영·현장 연계·기록을 맡는 방식으로 협의할 수 있습니다. 실제 역할과 정보 공유 범위는 해당 사업의 지침과 계약에 따라 정합니다.',
  },
  {
    question: '사업 전체가 아니라 일부 과정만 맡길 수 있나요?',
    answer: '초기 참여 과정, 소그룹 활동, 가족지원, 지역 자원 연계, 운영 결과 정리 등 필요한 업무를 중심으로 협의할 수 있습니다. 대상과 규모, 일정에 맞춰 필요한 인력과 결과물을 함께 정합니다.',
  },
  {
    question: '일경험 지원이 끝난 뒤에도 채용과 지원이 이어지나요?',
    answer: '일경험의 참여 기간과 지원 조건은 해당 사업의 기준을 따릅니다. 채용은 기업의 인력 수요와 채용 절차에 따라 결정됩니다. 종료 후 연계·고용 현황 확인 등이 필요하면 담당 주체, 기간, 인건비와 예산을 사업 범위에 포함해 협의합니다.',
  },
  {
    question: '2026년 사업 사례와 성과는 어디에서 볼 수 있나요?',
    answer: '청년재단 청년다다름사업 대구제작소와 청년 탄탄대로는 현재 운영 중입니다. 실적은 종료 후 집계와 검토를 거쳐 정리하고, 사례는 당사자 동의와 비식별 처리를 확인한 뒤 공개합니다. 현재 공개 실적은 2025년 고립·은둔 청년 지원사업을 참고해 주세요.',
  },
];

const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4';

export default function PartnershipPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-navy py-16 text-white sm:py-24">
          <div className={container}>
            <p className="text-xs font-bold tracking-wide text-white/80">지자체 · 청년센터 · 복지기관 · 재단</p>
            <h1 className="mt-5 max-w-3xl break-keep text-3xl font-bold leading-snug sm:text-5xl">청년의 참여가 이어지도록,<br />현장에서 함께 운영합니다</h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/85 sm:text-base">소이랩은 청년을 만나는 과정, 일상회복과 관계 활동, 지역 자원 연계와 결과 정리를 함께합니다. 기관의 사업 목표와 기존 지원체계에 맞춰 필요한 수행 범위를 정합니다.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#scope" className={`${button} bg-white text-navy`}>수행 범위 살펴보기</a>
              <a href="#inquiry" className={`${button} border border-white/60 text-white hover:bg-white/10`}>기관 협력 문의</a>
            </div>
          </div>
        </section>

        <section id="scope" aria-labelledby="scope-title" className="scroll-mt-24 bg-[#F6F7FB] py-16 sm:py-20">
          <div className={container}>
            <p className="text-xs font-bold text-forest">협의 가능한 수행 범위</p>
            <h2 id="scope-title" className="mt-3 break-keep text-2xl font-bold text-navy sm:text-3xl">어느 과정에 현장 운영이 필요한가요?</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">아래 업무를 사업 전체 또는 필요한 과정으로 협의할 수 있습니다. 대상·규모·기간에 따라 활동과 결과물을 구체화합니다.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {scopes.map((scope) => (
                <article key={scope.title} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-navy">{scope.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-forest">{scope.need}</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{scope.work}</p>
                  <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-6 text-gray-600"><span className="font-bold text-gray-900">결과물 예시</span><br />{scope.outputs}</p>
                </article>
              ))}
            </div>
            <Link href="/livinglab/family" className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-navy underline underline-offset-4">청년·가족지원 리빙랩 도입안 보기 →</Link>
          </div>
        </section>

        <section aria-labelledby="roles-title" className="bg-white py-16 sm:py-20">
          <div className={container}>
            <h2 id="roles-title" className="break-keep text-2xl font-bold text-navy sm:text-3xl">기관의 지원체계와 현장 운영을 연결합니다</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">공공센터와 유관기관이 맡고 있는 업무를 확인하고, 함께 운영할 과정과 책임을 분명히 정합니다. 아래는 역할 분담의 예시입니다.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F6F7FB] p-6 sm:p-8">
                <h3 className="text-lg font-bold text-navy">의뢰·협력 기관</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600">
                  <li>사업 목표·대상 기준·예산과 지원 결정</li>
                  <li>기관의 사례관리 및 공공·전문 서비스 연결</li>
                  <li>대상자 추천과 정보 공유에 필요한 절차 확인</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-navy/20 bg-navy/5 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-navy">소이랩과 협의할 업무</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600">
                  <li>참여 흐름과 활동 구성, 회차별 현장 운영</li>
                  <li>참여 과정 점검과 지역 자원 연계 실무</li>
                  <li>운영 기록·익명 집계·결과보고와 종료 시 인계</li>
                </ul>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-gray-600">상담·치료 등 전문 지원이 필요한 경우에는 해당 전문기관과의 연계를 협의합니다. 종료 후 점검도 담당 주체·기간·인력·예산을 정한 범위에서 진행합니다.</p>
          </div>
        </section>

        <section aria-labelledby="experience-title" className="bg-[#F6F7FB] py-16 sm:py-20">
          <div className={container}>
            <h2 id="experience-title" className="text-2xl font-bold text-navy sm:text-3xl">사업 경험과 공개 실적</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <p className="text-xs font-bold text-forest">종료 사업 · 공개 실적</p>
                <h3 className="mt-3 text-lg font-bold text-navy">2025 고립·은둔 청년 지원사업</h3>
                <p className="mt-4 text-sm leading-7 text-gray-600">발굴·등록·이수와 지역기관 연계를 구분한 공개 지표 및 성과 사례집을 확인할 수 있습니다.</p>
                <Link href="/#stats" className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-navy underline underline-offset-4">2025년 성과와 사례집 안내 →</Link>
              </article>
              <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <p className="text-xs font-bold text-forest">2026년 운영 중</p>
                <h3 className="mt-3 text-lg font-bold text-navy">청년다다름 대구제작소 · 청년 탄탄대로</h3>
                <p className="mt-4 text-sm leading-7 text-gray-600">청년재단의 맞춤형 자립 지원사업과 지역 기업·기관이 함께하는 일경험 연계사업을 운영하고 있습니다. 두 사업의 실적과 사례는 종료 후 정리해 공개합니다.</p>
                <Link href="/#programs" className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-navy underline underline-offset-4">진행 중인 사업 소개 →</Link>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="process-title" className="bg-white py-16 sm:py-20">
          <div className={container}>
            <h2 id="process-title" className="text-2xl font-bold text-navy sm:text-3xl">협의는 이렇게 진행합니다</h2>
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-gray-200 p-6">
                  <p className="text-sm font-bold text-forest">0{index + 1}</p>
                  <h3 className="mt-3 text-lg font-bold text-navy">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="bg-[#F6F7FB] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 id="faq-title" className="text-2xl font-bold text-navy sm:text-3xl">협력 전에 자주 묻는 질문</h2>
            <div className="mt-8 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                  <summary className="cursor-pointer font-bold leading-7 text-navy focus-visible:outline-2 focus-visible:outline-offset-4">{faq.question}</summary>
                  <p className="mt-4 text-sm leading-7 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="inquiry" aria-labelledby="inquiry-title" className="scroll-mt-24 bg-navy py-16 text-white sm:py-20">
          <div className={`${container} grid gap-8 lg:grid-cols-2 lg:items-center`}>
            <div>
              <h2 id="inquiry-title" className="break-keep text-2xl font-bold sm:text-3xl">우리 기관에 필요한 운영 범위를 알려주세요</h2>
              <p className="mt-5 text-sm leading-8 text-white/85">기관명, 운영 지역, 지원 대상, 희망 일정과 맡기고 싶은 업무를 보내주세요. 예산이 정해져 있다면 함께 알려주시면 수행 범위를 협의하는 데 도움이 됩니다.</p>
              <a href={youthBusinessInquiryHref()} className={`${button} mt-6 bg-white text-navy`}>기관 협력 문의 메일 쓰기</a>
              <p className="mt-4 text-xs leading-6 text-white/80">이메일 앱이 열립니다. 참여자의 이름·건강정보 등 개인 사례는 적지 말아 주세요.</p>
            </div>
            <div className="rounded-2xl border border-white/25 p-6 sm:p-8">
              <p className="text-sm font-bold">협동조합 소이랩</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <a href="mailto:soilabcoop@gmail.com" className="underline underline-offset-4">soilabcoop@gmail.com</a>
                <a href="tel:053-941-9003" className="underline underline-offset-4">053-941-9003</a>
              </div>
              <p className="mt-5 text-xs leading-6 text-white/80">청년·가족의 개별 사업 문의는 현재 사업 운영 안내에서 대상과 모집 여부를 먼저 확인해 주세요.</p>
              <a href="https://bridge.soilab-youth.kr/#youth-projects" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">현재 사업 운영 안내 ↗</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

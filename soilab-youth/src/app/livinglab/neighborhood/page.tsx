import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SectionHeading from '@/components/livinglab/SectionHeading';
import { neighborhoodLivingLab as program, neighborhoodInquiryHref } from '@/data/neighborhood-livinglab';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  path: program.path,
  title: `${program.title} | 기관 도입 제안`,
  description: program.description,
});

const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy';
const sections = [
  { href: '#approach', label: '대상과 참여' },
  { href: '#adoption', label: '단계별 도입안' },
  { href: '#schedule', label: '운영 과정' },
  { href: '#experiments', label: '실험 예시' },
  { href: '#outcomes', label: '역할·산출물·평가' },
  { href: '#evidence', label: '참고 근거' },
  { href: '#inquiry', label: '기관 문의' },
];

export default function NeighborhoodLivingLabPage() {
  return (
    <>
      <Header />
      <main className="[&_h1]:break-keep [&_h2]:break-keep [&_h3]:break-keep [&_p]:break-keep [&_dd]:break-keep">
        <section aria-labelledby="neighborhood-title" className="bg-[#F0F6F8]">
          <div className={`${container} pb-14 pt-8 sm:pb-20`}>
            <nav aria-label="현재 위치" className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <Link href="/" className="hover:underline">홈</Link><span aria-hidden="true">/</span>
              <Link href="/livinglab" className="hover:underline">소이랩 리빙랩</Link><span aria-hidden="true">/</span>
              <span aria-current="page">생활권 외로움 예방</span>
            </nav>
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
              <div>
                <p className="text-xs font-bold tracking-wider text-blue-dark">{program.status} · 지자체 · 지역기관 · 생활권 공간</p>
                <h1 id="neighborhood-title" className="mt-5 text-3xl font-bold leading-[1.3] text-navy sm:text-5xl">생활권 외로움<br />예방 리빙랩</h1>
                <p className="mt-6 text-xl font-medium leading-8 text-gray-900">편하게 들를 곳에서,<br />다시 이어지는 관계로.</p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">{program.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={neighborhoodInquiryHref()} className={`${button} bg-navy text-white hover:bg-navy-dark`}>도입 협의 메일 쓰기</a>
                  <a href="#adoption" className={`${button} border border-navy/30 text-navy hover:bg-white`}>단계별 도입안 보기</a>
                </div>
                <p className="mt-4 text-xs leading-6 text-gray-600">지역의 대상·일정·예산을 협의할 프로그램 설계안입니다.</p>
              </div>
              <div className="rounded-2xl border border-blue/20 bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-wider text-blue-dark">동네에서 함께 시험할 세 가지 질문</p>
                <ol className="mt-7 space-y-6">
                  {program.experiments.map((item, index) => (
                    <li key={item.id} className="flex gap-4">
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3F6] text-sm font-bold text-blue-dark">{index + 1}</span>
                      <div><h2 className="font-bold text-gray-900">{item.title}</h2><p className="mt-1 text-sm leading-7 text-gray-600">{item.question}</p></div>
                    </li>
                  ))}
                </ol>
                <p className="mt-7 border-t border-blue/15 pt-5 text-sm leading-7 text-blue-dark">주민이 과제를 고르고, 사용해 보고, 바꿀 내용을 결정합니다.</p>
              </div>
            </div>
            <dl className="mt-12 grid gap-5 border-t border-blue/20 pt-7 sm:grid-cols-2 lg:grid-cols-4">
              {program.summary.map(item => <div key={item.value}><dt className="text-xs leading-6 text-gray-600">{item.label}</dt><dd className="mt-1 text-2xl font-bold text-navy">{item.value}</dd></div>)}
            </dl>
          </div>
        </section>

        <nav aria-label="생활권 외로움 예방 리빙랩 페이지 안내" className="border-b border-gray-200">
          <div className={`${container} flex flex-wrap gap-x-6 gap-y-1 py-3`}>
            {sections.map(item => <a key={item.href} href={item.href} className="py-2 text-xs font-medium text-gray-600 hover:text-navy focus-visible:outline-2 focus-visible:outline-navy sm:text-sm">{item.label}</a>)}
          </div>
        </nav>

        <section id="approach" aria-labelledby="approach-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="approach-title" eyebrow="대상과 참여" title="청년의 회복과 생활권의 관계를 함께 살핍니다" description="고립·은둔 청년 지원에서 시작한 질문을 지역의 공간과 관계로 넓힙니다. 주민의 필요와 기존 서비스의 공백을 먼저 확인하고 참여 대상을 정합니다." />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {program.audiences.map((item, index) => <article key={item.title} className="border-t-2 border-blue/30 pt-5"><p className="text-xs font-bold text-blue-dark">0{index + 1}</p><h3 className="mt-3 text-lg font-bold text-gray-950">{item.title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{item.detail}</p></article>)}
            </div>
            <p className="mt-8 rounded-xl bg-cream p-5 text-sm leading-7 text-gray-700">참여자는 개별 의견, 온라인 연락, 소그룹 등 편한 방식을 협의하고 쉬거나 중단할 수 있습니다. 참여 보상과 이동 등 접근 지원을 예산에 반영하며, 전문 상담·치료가 필요한 경우의 지원 경로는 별도로 정합니다.</p>
            <Link href="/livinglab/family" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">청년과 가족의 생활 과제를 다루는 가족지원 리빙랩도 살펴보기 →</Link>
          </div>
        </section>

        <section id="adoption" aria-labelledby="adoption-title" className="scroll-mt-24 border-y border-gray-100 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="adoption-title" eyebrow="단계별 도입안" title="4주 진단부터, 지역의 준비 정도에 맞춰 시작합니다" description="사전진단만 별도로 시작할 수 있고, 각 단계의 결과를 확인한 뒤 다음 범위를 협의합니다. 기간·규모·산출물은 지역의 여건과 예산에 맞춰 확정합니다." />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {program.adoptionStages.map(stage => (
                <article key={stage.id} className={`flex flex-col rounded-2xl border p-6 ${stage.id === 'design' ? 'border-blue/40 bg-[#F0F6F8]' : 'border-gray-200 bg-white'}`}>
                  <p className="text-xs font-bold text-blue-dark">{stage.number}단계 · {stage.duration}</p>
                  <h3 className="mt-4 text-xl font-bold text-gray-950">{stage.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{stage.audience}</p>
                  <dl className="mt-5 space-y-4 border-t border-gray-200 pt-5">
                    {[
                      ['함께 할 일', stage.scope],
                      ['남기는 산출물', stage.outputs],
                      ['기관과 준비할 것', stage.preparation],
                    ].map(([label, detail]) => <div key={label}><dt className="text-xs font-bold text-gray-800">{label}</dt><dd className="mt-1 text-sm leading-7 text-gray-600">{detail}</dd></div>)}
                  </dl>
                  <p className="mb-6 mt-5 border-t border-gray-100 pt-4 text-xs leading-6 text-gray-600">{stage.next}</p>
                  <a href={neighborhoodInquiryHref(stage.title)} className={`${button} mt-auto border border-navy text-navy hover:bg-navy hover:text-white`}>{stage.number}단계 도입 문의</a>
                </article>
              ))}
            </div>
            <p className="mt-6 rounded-xl bg-cream p-5 text-sm leading-7 text-gray-700"><span className="font-bold text-navy">전체 기본안은 총 20주입니다.</span> 1단계 준비 4주 → 2단계 실증 12주 → 종료 4주 후 점검으로 이어집니다. 3단계 확산·전수는 실증 이후 별도로 협의합니다.</p>
          </div>
        </section>

        <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-24 bg-cream py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="schedule-title" eyebrow="운영 과정" title="지역을 듣고, 두 번 시험하고, 이어갈 방법을 정합니다" description="전체 기본안은 준비 4주와 실증 12주를 운영하고, 종료 4주 후 점검까지 총 20주입니다. 거점 2~3곳과 주민 15~20명을 기준으로 범위와 회차를 협의합니다." />
            <ol className="mt-9 divide-y divide-gray-200 border-y border-gray-200">
              {program.schedule.map(item => <li key={item.period} className="grid gap-3 py-6 sm:grid-cols-[7rem_1fr] lg:grid-cols-[7rem_0.85fr_1.3fr] lg:gap-6"><p className="text-sm font-bold text-blue-dark">{item.period}</p><h3 className="font-bold text-gray-950">{item.title}</h3><div className="sm:col-start-2 lg:col-start-auto"><p className="text-sm leading-7 text-gray-600">{item.detail}</p><p className="mt-2 text-xs leading-6 text-navy"><span className="font-bold">남기는 기록</span> · {item.output}</p></div></li>)}
            </ol>
            <p className="mt-6 border-l-4 border-blue bg-white p-5 text-sm leading-7 text-gray-700">종료 4주 후에는 공간 이용과 원하는 관계가 이어지는지, 필요한 지원을 이용했는지 확인합니다. 관찰한 변화와 함께 확인하지 못한 내용도 기록합니다.</p>
          </div>
        </section>

        <section id="experiments" aria-labelledby="experiments-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="experiments-title" eyebrow="실험 예시" title="방문 한 번에서 다음 만남과 지원까지" description="공동설계를 돕는 가상의 예시입니다. 실제 과제는 주민이 선택하며, 아래 활동의 효과가 검증되었다는 뜻은 아닙니다." />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {program.experiments.map((item, index) => <article key={item.id} className="rounded-2xl border border-gray-200 p-6"><p className="text-xs font-bold text-blue-dark">실험 예시 0{index + 1}</p><h3 className="mt-4 text-xl font-bold text-gray-950">{item.title}</h3><p className="mt-3 text-sm font-medium leading-7 text-navy">{item.question}</p><dl className="mt-5 space-y-4 border-t border-gray-100 pt-5">{[['함께 시험할 방법', item.action], ['살펴볼 변화', item.observe], ['다시 고치는 방법', item.improve]].map(([label, detail]) => <div key={label}><dt className="text-xs font-bold text-gray-800">{label}</dt><dd className="mt-1 text-sm leading-7 text-gray-600">{detail}</dd></div>)}</dl></article>)}
            </div>
          </div>
        </section>

        <section id="outcomes" aria-labelledby="outcomes-title" className="scroll-mt-24 bg-[#F0F6F8] py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="outcomes-title" eyebrow="협력과 산출물" title="지역이 이어갈 역할과 운영 방법을 남깁니다" description="주민, 소이랩, 거점기관, 지자체와 연구 협력기관의 역할을 나눠 설계합니다. 필요한 인력과 연계 범위는 착수 전에 확정합니다." />
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">{program.roles.map(item => <div key={item.title} className="border-t border-blue/25 pt-4"><dt className="font-bold text-navy">{item.title}</dt><dd className="mt-2 text-sm leading-7 text-gray-600">{item.detail}</dd></div>)}</dl>
            <div className="mt-12 rounded-2xl bg-white p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-950">기관에 남기는 네 가지 산출물</h3>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">{program.deliverables.map(item => <div key={item.title}><dt className="text-sm font-bold text-blue-dark">{item.title}</dt><dd className="mt-2 text-sm leading-7 text-gray-600">{item.detail}</dd></div>)}</dl>
            </div>
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-950">참여 횟수와 함께, 관계와 연결의 변화를 봅니다</h3>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">{program.metrics.map(item => <div key={item.title}><dt className="text-sm font-bold text-blue-dark">{item.title}</dt><dd className="mt-2 text-sm leading-7 text-gray-600">{item.detail}</dd></div>)}</dl>
              <p className="mt-6 text-xs leading-6 text-gray-600">초기·종료·종료 4주 후에 같은 항목을 확인하고 응답 인원·미응답·중단을 함께 보고합니다. 자체 질문은 경험과 운영 변화를 살피는 용도이며 진단도구로 사용하지 않습니다. 작은 규모의 전후 변화만으로 인과 효과나 고독사·자살 감소 효과를 확정하지 않습니다.</p>
            </div>
            <p className="mt-8 border-t border-blue/20 pt-5 text-xs leading-6 text-gray-600">참여·기록·기관 간 공유·외부 공개의 동의 범위를 구분하고, 최소한의 기록과 보관·열람·삭제 기준을 협의합니다. 개인 응답은 허락 없이 다른 참여자나 기관에 전달하지 않으며, 공개 자료는 비식별 집계를 기본으로 합니다.</p>
          </div>
        </section>

        <section id="evidence" aria-labelledby="evidence-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="evidence-title" eyebrow="참고 근거" title="연구의 진단에서, 소이랩의 실험 제안으로" description="인천 사례를 참고하되 도입 지역의 서비스와 주민 경험을 다시 확인합니다. 연구가 제안한 방향과 소이랩이 구성한 운영안을 구분합니다." />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-6"><h3 className="text-sm font-bold text-blue-dark">보고서에서 확인한 내용</h3><p className="mt-3 text-sm leading-7 text-gray-600">외로움 저위험군과 중장년층의 서비스 확충, 단계별 연계, 정책 총괄·전문 운영·현장 실행의 역할 분담을 제안합니다. 연령별 공백과 외로움 정도별 공백을 함께 살핀 진단입니다.</p></div>
              <div className="rounded-xl bg-cream p-6"><h3 className="text-sm font-bold text-navy">소이랩의 적용 제안</h3><p className="mt-3 text-sm leading-7 text-gray-600">기존 공간에서의 첫 방문·재방문·도움 요청을 주민과 시험하는 운영안입니다. 기간·규모·실험 예시는 소이랩의 제안이며 보고서의 권고 수치, 이미 수행한 실적 또는 인천시 위탁사업을 뜻하지 않습니다.</p></div>
            </div>
            <ul className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {program.sources.map(source => <li key={source.href} className="py-5"><p className="text-xs text-gray-500">{source.year}</p><a href={source.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-bold leading-7 text-navy underline underline-offset-4">{source.title} ↗</a><p className="mt-2 text-xs leading-6 text-gray-600">{source.detail}</p></li>)}
            </ul>
          </div>
        </section>

        <section id="inquiry" aria-labelledby="inquiry-title" className="scroll-mt-24 bg-navy py-16 text-white sm:py-20">
          <div className={container}>
            <SectionHeading id="inquiry-title" eyebrow="기관 도입 문의" title="우리 동네에서 시작할 과제를 함께 정합니다" description="지역, 함께할 공간·기관, 참여 규모와 일정을 알려주세요. 사전 진단부터 전체 실증까지 필요한 범위를 협의합니다." inverse />
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/80">견적은 운영 인력, 주민 참여 보상, 공간·이동 등 접근 지원, 도구 제작, 평가·기록, 기관 연계와 후속 점검 범위를 나눠 제안합니다. 기존 사업과 겹치는 부분과 실제로 보완할 과제를 먼저 확인합니다.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={neighborhoodInquiryHref()} className={`${button} bg-white text-navy hover:bg-gray-100 focus-visible:outline-white`}>도입 협의 메일 쓰기</a>
              <Link href="/livinglab" className={`${button} border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white`}>소이랩 리빙랩으로 돌아가기</Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/75">기본 메일 앱에서 문의 초안을 엽니다. {program.email} · 개인 사례나 건강정보는 적지 말아 주세요.</p>
            <p className="mt-8 border-t border-white/20 pt-5 text-sm leading-7 text-white/80">청년·가족의 개인 지원이 필요하신가요? <Link href="/research/support" className="font-bold text-white underline underline-offset-4">지역 지원 문의처 살펴보기 →</Link></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

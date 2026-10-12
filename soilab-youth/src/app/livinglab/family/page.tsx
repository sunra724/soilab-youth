import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SectionHeading from '@/components/livinglab/SectionHeading';
import { familyLivingLab as program, familyInquiryHref } from '@/data/family-livinglab';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  path: program.path,
  title: `${program.title} | 기관 도입 제안`,
  description: program.description,
});

const sections = [
  { href: '#approach', label: '공동설계 방식' },
  { href: '#schedule', label: '12주 운영안' },
  { href: '#experiments', label: '생활 실험 예시' },
  { href: '#deliverables', label: '산출물·평가' },
  { href: '#packages', label: '도입 범위' },
  { href: '#inquiry', label: '기관 문의' },
];

const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy';

export default function FamilyLivingLabPage() {
  return (
    <>
      <Header />
      <main className="[&_h1]:break-keep [&_h2]:break-keep [&_h3]:break-keep [&_p]:break-keep [&_dd]:break-keep">
        <section aria-labelledby="family-title" className="overflow-hidden bg-[#F3F6F4]">
          <div className={`${container} pb-14 pt-8 sm:pb-20`}>
            <nav aria-label="현재 위치" className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <Link href="/" className="hover:underline">홈</Link><span aria-hidden="true">/</span>
              <Link href="/livinglab" className="hover:underline">소이랩 리빙랩</Link><span aria-hidden="true">/</span>
              <span aria-current="page">가족지원</span>
            </nav>
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
              <div>
                <p className="text-xs font-bold tracking-wider text-forest">{program.status} · 지자체 · 청년센터 · 복지기관</p>
                <h1 id="family-title" className="mt-5 text-3xl font-bold leading-[1.3] text-navy sm:text-5xl">
                  고립·은둔 청년<br />가족지원 리빙랩
                </h1>
                <p className="mt-6 text-xl font-medium leading-8 text-gray-900">가족과 함께 찾고,<br className="sm:hidden" /> 일상에서 바꾸는 회복의 방법.</p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
                  청년과 가족, 현장 실무자가 생활 속 어려움을 함께 정하고 해결안을 만듭니다.
                  두 차례 생활 실험과 개선을 통해 지역이 이어갈 가족지원의 방법을 정리합니다.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={familyInquiryHref()} className={`${button} bg-navy text-white hover:bg-navy-dark`}>도입 협의 메일 쓰기</a>
                  <a href="#schedule" className={`${button} border border-navy/30 text-navy hover:bg-white`}>12주 운영안 살펴보기</a>
                </div>
                <p className="mt-4 text-xs leading-6 text-gray-600">기관별 일정·규모·예산을 협의하는 프로그램 제안입니다.</p>
              </div>
              <div className="rounded-2xl border border-green/20 bg-white p-6 sm:p-8">
                <p className="text-xs font-bold tracking-wider text-forest">함께 정하고, 사용하고, 다시 고치는 과정</p>
                <ol className="mt-7 space-y-5">
                  {[
                    ['함께 듣기', '청년과 가족의 이야기를 각각 듣습니다.'],
                    ['함께 만들기', '바꾸고 싶은 생활 장면과 도구를 정합니다.'],
                    ['일상에서 시험하기', '동의한 범위에서 사용하고 느낌을 기록합니다.'],
                    ['배우고 개선하기', '부담과 변화를 살피고 다시 시험합니다.'],
                  ].map(([title, description], index) => (
                    <li key={title} className="flex gap-4">
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECF3EF] text-sm font-bold text-forest">{index + 1}</span>
                      <div><h2 className="text-base font-bold text-gray-900">{title}</h2><p className="mt-1 text-xs leading-6 text-gray-600">{description}</p></div>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 border-t border-green/15 pt-5 text-sm font-medium leading-7 text-forest">참여자가 과제와 해결안의 수정 결정에 함께합니다.</div>
              </div>
            </div>
            <dl className="mt-12 grid gap-5 border-t border-green/20 pt-7 sm:grid-cols-3">
              {program.summary.map(item => (
                <div key={item.value}><dt className="text-xs leading-6 text-gray-600">{item.label}</dt><dd className="mt-1 text-2xl font-bold text-navy">{item.value}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        <nav aria-label="가족지원 리빙랩 페이지 안내" className="border-b border-gray-200 bg-white">
          <div className={`${container} flex flex-wrap gap-x-6 gap-y-1 py-3`}>
            {sections.map(item => <a key={item.href} href={item.href} className="py-2 text-xs font-medium text-gray-600 hover:text-navy focus-visible:outline-2 focus-visible:outline-navy sm:text-sm">{item.label}</a>)}
          </div>
        </nav>

        <section id="approach" aria-labelledby="approach-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="approach-title" eyebrow="공동설계 방식" title="가족과 청년이 설계의 주체가 됩니다" description="이해 교육과 가족 지원을 바탕으로, 공동 문제정의 → 해결안 제작 → 생활 실험 → 평가와 개선을 연결합니다." />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {program.principles.map((item, index) => (
                <article key={item.title} className="border-t-2 border-green/40 pt-5">
                  <p className="text-xs font-bold text-forest">0{index + 1}</p><h3 className="mt-3 text-lg font-bold text-gray-900">{item.title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{item.description}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 text-xs leading-6 text-gray-500">설계 참고: 실제 생활 환경의 공동창조와 실험을 강조하는 <a href="https://enoll.org/living-labs/" target="_blank" rel="noopener noreferrer" className="text-navy underline underline-offset-4">ENoLL의 리빙랩 원칙</a>을 참고했습니다.</p>
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-950">함께 만드는 사람들</h3>
              <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {program.roles.map(role => <div key={role.title}><dt className="font-bold text-navy">{role.title}</dt><dd className="mt-2 text-sm leading-7 text-gray-600">{role.detail}</dd></div>)}
              </dl>
              <p className="mt-6 rounded-lg bg-[#F3F6F4] p-4 text-sm leading-7 text-gray-700">가족만으로 시작하는 지원과 청년이 직접 참여하는 활동의 범위를 구분합니다. 청년의 선택권과 각자의 속도를 운영 과정에 반영합니다.</p>
            </div>
          </div>
        </section>

        <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-24 bg-cream py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="schedule-title" eyebrow="12주 운영안" title="두 번의 실험이 다음 운영 방법으로 이어집니다" description="10~12가족을 기준으로 공동 워크숍 8회, 가족별 점검 2회와 청년 공동설계를 조합한 기본안입니다. 회차와 참여 방식은 착수 전에 함께 정합니다." />
            <ol className="mt-9 divide-y divide-gray-200 border-y border-gray-200">
              {program.schedule.map((item, index) => (
                <li key={item.weeks} className="grid gap-3 py-6 sm:grid-cols-[6rem_1fr] lg:grid-cols-[6rem_0.75fr_1.3fr] lg:gap-6">
                  <p className="text-sm font-bold text-forest">{item.weeks}</p>
                  <h3 className="text-base font-bold text-gray-950"><span className="mr-2 text-xs text-gray-400">0{index + 1}</span>{item.title}</h3>
                  <div className="sm:col-start-2 lg:col-start-auto"><p className="text-sm leading-7 text-gray-600">{item.activity}</p><p className="mt-2 text-xs leading-6 text-navy"><span className="font-bold">남기는 기록</span> · {item.output}</p></div>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-l-4 border-green bg-white p-5"><h3 className="text-sm font-bold text-forest">종료 4주 후, 이어지는지 확인합니다</h3><p className="mt-2 text-sm leading-7 text-gray-600">해결안을 계속 사용하는지, 부담이 달라졌는지, 필요한 후속 지원이 연결되었는지 점검합니다. 기본 운영 12주에 후속 점검 기간을 더한 일정으로 협의합니다.</p></div>
          </div>
        </section>

        <section id="experiments" aria-labelledby="experiments-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="experiments-title" eyebrow="생활 실험 예시" title="연락 한 번, 대화 한 장면부터 구체적으로" description="아래는 공동설계를 돕기 위한 예시입니다. 실제 과제는 참여자가 고르며, 효과가 확인된 성공사례를 뜻하지 않습니다." />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {program.experiments.map((item, index) => (
                <article key={item.id} className="rounded-2xl border border-gray-200 p-6">
                  <span className="text-xs font-bold text-forest">실험 예시 0{index + 1}</span><h3 className="mt-4 text-lg font-bold text-gray-950">{item.title}</h3><p className="mt-3 text-sm font-medium leading-7 text-navy">{item.question}</p>
                  <dl className="mt-5 space-y-4 border-t border-gray-100 pt-5">
                    {[[ '만드는 도구', item.prototype ], [ '살펴보는 변화', item.observe ], [ '다시 고치는 방법', item.improve ]].map(([label, detail]) => <div key={label}><dt className="text-xs font-bold text-gray-800">{label}</dt><dd className="mt-1 text-sm leading-7 text-gray-600">{detail}</dd></div>)}
                  </dl>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-gray-600">참여자는 언제든 쉬거나 중단할 수 있습니다. 부담이 커지거나 관계 갈등이 심해지면 실험을 멈추고 담당자가 개별 지원과 전문기관 연계를 검토합니다.</p>
          </div>
        </section>

        <section id="deliverables" aria-labelledby="deliverables-title" className="scroll-mt-24 bg-[#F3F6F4] py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="deliverables-title" eyebrow="산출물과 평가" title="기관이 이어갈 도구와 운영 방법을 남깁니다" description="참여자가 확인한 기록을 바탕으로, 도움이 된 조건과 한계를 함께 정리합니다. 아래 산출물의 범위와 활용 방식은 계약 단계에서 확정합니다." />
            <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {program.deliverables.map((item, index) => <div key={item.title} className="border-t border-green/25 pt-4"><dt className="text-sm font-bold text-navy"><span className="mr-2 text-forest">0{index + 1}</span>{item.title}</dt><dd className="mt-2 text-sm leading-7 text-gray-600">{item.detail}</dd></div>)}
            </dl>
            <div className="mt-12 rounded-2xl bg-white p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-950">무엇이 달라졌는지, 누구의 관점인지 함께 봅니다</h3>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">{program.metrics.map(item => <div key={item.title}><dt className="text-sm font-bold text-forest">{item.title}</dt><dd className="mt-2 text-sm leading-7 text-gray-600">{item.detail}</dd></div>)}</dl>
              <p className="mt-6 border-t border-gray-100 pt-5 text-xs leading-6 text-gray-600">초기·종료·종료 4주 후에 같은 항목을 점검하고, 주간 사용 기록을 함께 봅니다. 청년의 응답과 가족의 관찰을 구분하고 응답 인원·미응답·중단 사유를 기록합니다. 소규모 실증의 전후 변화만으로 프로그램의 인과적 효과를 확정하지 않습니다.</p>
            </div>
          </div>
        </section>

        <section id="packages" aria-labelledby="packages-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="packages-title" eyebrow="기관 도입 범위" title="지역의 준비 정도에 맞춰 시작합니다" description="지자체, 청년센터, 복지기관 등과 지역의 과제·참여 기반·실행 자원을 먼저 확인한 뒤 범위와 견적을 제안합니다." />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {program.packages.map(item => (
                <article key={item.id} className={`flex flex-col rounded-2xl border p-6 ${item.id === 'pilot' ? 'border-navy bg-[#F4F5FA]' : 'border-gray-200 bg-white'}`}>
                  <p className="text-xs font-bold text-forest">{item.duration}{item.id === 'pilot' ? ' · 기본 제안' : ''}</p><h3 className="mt-4 text-xl font-bold text-gray-950">{item.name}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{item.audience}</p>
                  <dl className="mt-5 space-y-4 border-t border-gray-200 pt-5"><div><dt className="text-xs font-bold text-gray-800">운영 범위</dt><dd className="mt-1 text-sm leading-7 text-gray-600">{item.scope}</dd></div><div><dt className="text-xs font-bold text-gray-800">대표 산출물</dt><dd className="mt-1 text-sm leading-7 text-gray-600">{item.output}</dd></div></dl>
                  <p className="mb-6 mt-4 text-xs leading-6 text-gray-600">{item.note}</p><a href={familyInquiryHref(item.name)} className={`${button} mt-auto border border-navy text-navy hover:bg-navy hover:text-white`}>이 범위로 도입 문의</a>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-gray-600">견적은 운영 인력, 당사자 참여 보상, 공간·접근 지원, 도구 제작, 평가·기록, 상담·연계와 후속 점검 범위를 구분해 협의합니다.</p>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="bg-cream py-16 sm:py-20">
          <div className={container}>
            <SectionHeading id="faq-title" eyebrow="도입 전 살펴볼 내용" title="참여 방식과 운영 조건을 확인하세요" />
            <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {program.faqs.map(item => <details key={item.question} className="group py-5"><summary className="cursor-pointer text-sm font-bold leading-7 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy sm:text-base">{item.question}</summary><p className="mt-4 max-w-4xl text-sm leading-8 text-gray-600">{item.answer}</p></details>)}
            </div>
          </div>
        </section>

        <section id="inquiry" aria-labelledby="inquiry-title" className="scroll-mt-24 bg-navy py-16 text-white sm:py-20">
          <div className={`${container} grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center`}>
            <div><p className="text-xs font-bold tracking-wider text-white/80">기관 도입 문의</p><h2 id="inquiry-title" className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">우리 지역 가족지원의<br />다음 방법을 함께 만듭니다</h2><p className="mt-5 max-w-xl text-sm leading-8 text-white/85">운영 지역, 희망 시기, 예상 가족 수와 예산 범위를 알려주세요. 소이랩이 공동설계와 현장 실험의 범위, 필요한 인력과 산출물을 함께 정리합니다.</p></div>
            <div className="rounded-2xl border border-white/25 p-6 sm:p-8"><p className="text-sm font-bold">협동조합 소이랩 고립·은둔 청년 지원센터</p><a href={familyInquiryHref()} className={`${button} mt-5 w-full bg-white text-navy hover:bg-gray-100 focus-visible:outline-white`}>도입 협의 메일 쓰기</a><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"><a href={`mailto:${program.email}`} className="underline underline-offset-4">{program.email}</a><a href={program.phoneHref} className="underline underline-offset-4">{program.phone}</a></div><p className="mt-4 text-xs leading-6 text-white/80">버튼을 누르면 이메일 앱이 열립니다. 기관 문의에는 개인 사례나 건강정보를 적지 말아 주세요.</p></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

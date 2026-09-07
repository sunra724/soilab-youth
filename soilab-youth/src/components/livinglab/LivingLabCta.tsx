import Link from 'next/link';

interface LivingLabCtaProps {
  inquiryHref: string;
  supportHref: string;
  phone: string;
}

export default function LivingLabCta({ inquiryHref, supportHref, phone }: LivingLabCtaProps) {
  return (
    <section id="contact" aria-labelledby="livinglab-contact-title" className="scroll-mt-32 bg-navy py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold tracking-[0.18em] text-white/75">CONNECT WITH SOILAB</p>
        <h2 id="livinglab-contact-title" className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">필요한 도움과 함께할 질문을 연결합니다</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">청년과 가족은 지원 문의처를, 현장기관은 함께 다룰 질문과 협력 방법을 살펴보세요.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
            <h3 className="text-lg font-bold">청년·가족을 위한 지원 안내</h3>
            <p className="mt-3 text-sm leading-7 text-white/80">대구의 상담 문의처와 지원사업을 신청하기 전에 확인할 내용을 안내합니다.</p>
            <Link href={supportHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-navy hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">지원 문의처 알아보기 →</Link>
          </div>
          <div id="packages" className="scroll-mt-32 rounded-2xl border border-white/20 bg-white/10 p-6">
            <h3 className="text-lg font-bold">현장기관과 함께할 질문</h3>
            <p className="mt-3 text-sm leading-7 text-white/80">지역에서 겪는 지원의 어려움, 함께 시도하고 싶은 방법과 협력 범위를 이야기합니다.</p>
            <a href={inquiryHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/70 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">리빙랩 협력 문의 →</a>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-4 text-sm leading-7 text-white/80 sm:flex-row sm:justify-between">
          <p>소이랩 대표 문의 <a href={`tel:${phone.replace(/-/g, '')}`} className="underline underline-offset-4">{phone}</a></p>
          <a href="https://lab.soilabcoop.kr/stream" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">기관의 정책·사업 검토는 소이랩 포털에서 ↗</a>
        </div>
      </div>
    </section>
  );
}

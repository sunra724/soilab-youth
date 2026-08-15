interface LivingLabCtaProps {
  inquiryHref: string;
  supportHref: string;
  phone: string;
}

export default function LivingLabCta({ inquiryHref, supportHref, phone }: LivingLabCtaProps) {
  return (
    <section id="contact" aria-labelledby="livinglab-contact-title" className="scroll-mt-32 bg-navy py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-7 sm:p-10 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.18em] text-white/65">START A LOCAL PILOT</p>
            <h2 id="livinglab-contact-title" className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
              우리 지역의 고립·은둔청년 지원모델을 함께 설계해 보세요
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
              지역의 문제와 기존 자원을 진단하고, 비대면 발굴부터 단계별 일상회복까지 실행 가능한 실증사업으로 설계합니다.
            </p>
            <p className="mt-4 text-xs text-white/60">이 페이지는 기관용 사업 안내이며 긴급상담 창구가 아닙니다.</p>
          </div>
          <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
            <a
              href={inquiryHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              지역 실증사업 협의하기
            </a>
            <a
              href={supportHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/70 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              청년·가족 지원 문의
            </a>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-white/55">
          대표 문의 {phone} · 기관 문의와 청년·가족 지원 문의를 구분해 안내합니다.
        </p>
      </div>
    </section>
  );
}

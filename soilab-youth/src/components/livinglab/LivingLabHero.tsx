interface LivingLabHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  audience: string;
  inquiryHref: string;
}

export default function LivingLabHero({
  eyebrow,
  title,
  description,
  audience,
  inquiryHref,
}: LivingLabHeroProps) {
  return (
    <section
      id="hero"
      aria-labelledby="livinglab-title"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-navy text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 86% 18%, rgba(36,141,172,0.9), transparent 34%), radial-gradient(circle at 72% 78%, rgba(34,141,123,0.55), transparent 30%), linear-gradient(135deg, #363F7A 0%, #46549C 56%, #248DAC 100%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <svg viewBox="0 0 640 640" className="h-full w-full opacity-45" fill="none">
          <path d="M74 472 198 348l112 66 116-176 138 80" stroke="white" strokeOpacity=".42" strokeWidth="2" />
          <path d="m119 178 111 72 113-97 126 84" stroke="white" strokeOpacity=".25" strokeWidth="2" />
          {[
            [74, 472], [198, 348], [310, 414], [426, 238], [564, 318],
            [119, 178], [230, 250], [343, 153], [469, 237],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="18" fill="white" fillOpacity=".12" />
              <circle cx={cx} cy={cy} r="6" fill="white" fillOpacity=".82" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.22em] text-white/75 sm:text-sm">{eyebrow}</p>
          <h1 id="livinglab-title" className="mt-5 text-4xl font-bold leading-[1.16] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-xl">{description}</p>
          <p className="mt-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs leading-5 text-white/80 sm:text-sm">
            {audience}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={inquiryHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              지역 실증사업 협의하기
            </a>
            <a
              href="#outcomes"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/70 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              실증·성과 보기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

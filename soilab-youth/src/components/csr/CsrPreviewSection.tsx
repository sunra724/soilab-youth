import { csrPrograms } from '@/data/csr';

export default function CsrPreviewSection() {
  return (
    <section className="relative overflow-hidden bg-[#F4F0E5] py-20" aria-labelledby="csr-preview-title">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F5C95C]/35" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#CFE5D8]/70" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <span className="mb-4 inline-flex rounded-full bg-[#2F6B57] px-3 py-1.5 text-xs font-bold text-white">
              CSR · 기업사회공헌
            </span>
            <h2 id="csr-preview-title" className="text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl">
              청년의 다음 걸음을
              <br />
              기업과 함께 설계합니다
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-gray-600">
              후원 규모보다 청년에게 실제로 닿는 방식을 먼저 고민합니다. 일상회복, 지역상생,
              사회참여를 잇는 소이랩의 CSR 제안 프로그램을 확인해 보세요.
            </p>
            <a
              href="https://csr.soilab-youth.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#2F6B57] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#245343]"
            >
              CSR 전용 홈페이지 보기 <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {csrPrograms.map((program) => (
              <div
                key={program.slug}
                className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold" style={{ color: program.color }}>
                    {program.eyebrow}
                  </span>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: program.color }}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-bold text-gray-900">{program.title}</h3>
                <p className="mt-2 text-xs leading-5 text-gray-500">{program.outcomes.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #46549C 0%, #248DAC 100%)' }}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
             style={{ background: '#fff' }} />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10"
             style={{ background: '#fff' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 w-full">
        <div className="animate-fade-up max-w-2xl">
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            대구 고립·은둔 청년 지원 전문기관
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            청년의 속도로,<br />함께 걷겠습니다
          </h1>

          <p className="text-base sm:text-lg leading-relaxed mb-8"
             style={{ color: 'rgba(255,255,255,0.75)' }}>
            협동조합 소이랩은 고립·은둔 청년 곁에서<br />
            발굴하고, 연결하고, 회복을 함께 만들어갑니다.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#programs"
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: '#fff', color: '#46549C' }}
            >
              사업 소개 보기
            </a>
            <a
              href="https://forms.gle/ADcNkuMBENKfyuEi8"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg font-semibold text-sm border border-white text-white
                         transition-colors hover:bg-white/10"
            >
              성과 사례집 보기
            </a>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-y">
          <div className="flex flex-col items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="text-xs">scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

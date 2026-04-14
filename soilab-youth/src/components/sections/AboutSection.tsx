export default function AboutSection() {
  const cards = [
    { icon: '🔍', title: '발굴과 연결', desc: '보이지 않던 청년들을 지역 네트워크로 발견합니다' },
    { icon: '💚', title: '단계적 회복', desc: '심리안정부터 사회복귀까지 함께 걷습니다' },
    { icon: '🤝', title: '지역 협력',  desc: '25개 기관과 촘촘한 안전망을 만듭니다' },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* 텍스트 */}
          <div>
            <div className="w-10 h-0.5 mb-4" style={{ background: '#46549C' }} />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">소이랩을 소개합니다</h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">
              협동조합 소이랩은 지역사회 문제를 시민·기관·전문가와 함께 해결하는
              리빙랩 전문 조직입니다. 고립·은둔청년 지원사업을 통해 청년 개인의 회복을
              넘어 가족, 지역, 관계망 전체를 함께 바라보는 접근을 시도해 왔습니다.
            </p>
            <a
              href="https://soilabcoop.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg border transition-colors"
              style={{ borderColor: '#46549C', color: '#46549C' }}
            >
              더 알아보기 →
            </a>
          </div>

          {/* 카드들 */}
          <div className="flex flex-col gap-4">
            {cards.map((c) => (
              <div
                key={c.title}
                className="flex items-start gap-4 p-5 rounded-xl"
                style={{ background: '#F8F9FC', borderLeft: '3px solid #46549C' }}
              >
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{c.title}</div>
                  <div className="text-sm text-gray-500">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

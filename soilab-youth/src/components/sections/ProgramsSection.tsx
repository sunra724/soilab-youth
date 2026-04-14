import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function ProgramsSection() {
  return (
    <section id="programs" className="py-20" style={{ background: '#F8F9FC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: '#46549C' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">주요 사업</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 카드 1: 고립·은둔 청년 지원사업 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="h-1.5" style={{ background: '#46549C' }} />
            <div className="p-6">
              <Badge label="고립·은둔 청년" color="navy" />
              <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">고립·은둔 청년 지원사업</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                방 안에 머무는 청년들을 발견하고, 자신의 속도로 회복할 수 있도록
                단계적으로 지원합니다. 심리 안정부터 사회 복귀까지 함께합니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['#발굴', '#심리상담', '#일상회복', '#부모교육', '#사회복귀'].map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: '#ECEEF8', color: '#46549C' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-5">
                2025년 132명 발굴 · 이수율 100% · 25개 기관 연계
              </p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href="https://sunra724.github.io/youthreconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 text-white"
                  style={{ background: '#46549C' }}
                >
                  성과 사례집 보기
                </a>
                <a
                  href="/소이랩_고립은둔청년지원사업_성과사례집.pdf"
                  download
                  className="text-sm px-4 py-2 rounded-lg font-semibold border transition-colors"
                  style={{ borderColor: '#46549C', color: '#46549C' }}
                >
                  PDF 다운로드
                </a>
              </div>
            </div>
          </div>

          {/* 카드 2: 청년 다다름 사업 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="h-1.5" style={{ background: '#248DAC' }} />
            <div className="p-6">
              <Badge label="청년 연결" color="blue" />
              <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">청년 다다름 사업</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                청년의 다양한 삶의 방식을 인정하고 연결합니다.
                카드뉴스 발행, 활동 홍보, 지역 청년 네트워크를 통해
                청년이 서로를 발견합니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['#카드뉴스', '#청년네트워크', '#활동홍보', '#커뮤니티'].map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: '#E8F4FD', color: '#248DAC' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <Link
                  href="/cardnews"
                  className="text-sm px-4 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#248DAC' }}
                >
                  최신 카드뉴스 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

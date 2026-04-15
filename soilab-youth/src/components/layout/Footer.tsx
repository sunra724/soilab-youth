import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#1A1F36' }} className="text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 기관 정보 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                   style={{ background: '#46549C' }}>
                🌱
              </div>
              <span className="font-bold text-white text-sm">협동조합 소이랩</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              사업자등록번호 502-82-21040<br />
              고립·은둔 청년 곁에서 함께 걷습니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#about" className="hover:text-white transition-colors">소이랩 소개</Link></li>
              <li><Link href="/#programs" className="hover:text-white transition-colors">주요 사업</Link></li>
              <li><Link href="/cardnews" className="hover:text-white transition-colors">소식 &amp; 카드뉴스</Link></li>
              <li><Link href="/newsletter" className="hover:text-white transition-colors">뉴스레터</Link></li>
              <li>
                <a href="https://forms.gle/ADcNkuMBENKfyuEi8" target="_blank" rel="noopener noreferrer"
                   className="hover:text-white transition-colors">
                  성과 사례집 상세보기 →
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">연락처</h3>
            <ul className="space-y-2 text-sm">
              <li>📞 <a href="tel:05394194903" className="hover:text-white transition-colors">053-941-9003</a></li>
              <li>📧 <a href="mailto:soilabcoop@gmail.com" className="hover:text-white transition-colors">soilabcoop@gmail.com</a></li>
              <li>🌐 <a href="https://soilabcoop.kr" target="_blank" rel="noopener noreferrer"
                       className="hover:text-white transition-colors">soilabcoop.kr</a></li>
              <li>📍 대구광역시 북구 대현로 3, 2층(대현동)</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© 2026 협동조합 소이랩. All rights reserved.</span>
          <a href="https://forms.gle/ADcNkuMBENKfyuEi8" target="_blank" rel="noopener noreferrer"
             className="hover:text-gray-400 transition-colors">
            성과 사례집 상세보기 →
          </a>
        </div>
      </div>
    </footer>
  );
}

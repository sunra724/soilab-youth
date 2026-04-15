export default function ContactSection() {
  return (
    <section id="contact" className="py-20" style={{ background: '#46549C' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* 왼쪽 */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              청년 곁에서 함께하고 싶으신가요?
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
              고립·은둔 청년 지원에 관심 있는 기관, 보호자, 청년 본인 모두
              편하게 연락 주세요. 함께 고민하겠습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:05394194903"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#fff', color: '#46549C' }}
              >
                📞 전화 문의하기
              </a>
              <a
                href="mailto:soilabcoop@gmail.com"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-white text-white
                           transition-colors hover:bg-white/10"
              >
                📧 이메일 문의
              </a>
            </div>
          </div>

          {/* 오른쪽 연락처 카드 */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <ul className="space-y-3 text-sm text-white">
              <li>📞 <a href="tel:05394194903" className="hover:underline">053-941-9003</a></li>
              <li>📧 <a href="mailto:soilabcoop@gmail.com" className="hover:underline">soilabcoop@gmail.com</a></li>
              <li>🌐 <a href="https://soilabcoop.kr" target="_blank" rel="noopener noreferrer"
                       className="hover:underline">soilabcoop.kr</a></li>
              <li>📍 대구광역시 북구 대현로 3, 2층(대현동)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

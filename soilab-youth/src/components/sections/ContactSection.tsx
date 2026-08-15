export default function ContactSection() {
  return (
    <section id="contact" className="py-20" style={{ background: '#46549C' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* 왼쪽 */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              청년을 위한 사업을 함께 만들고 싶으신가요?
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
              기관·기업·재단의 사업 제안과 지역 협력 문의를 이메일로 받고 있습니다.
              상담이나 치료가 필요한 경우에는 지역 전문기관을 이용해 주세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:soilabcoop@gmail.com"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#fff', color: '#46549C' }}
              >
                📧 사업·협력 이메일 보내기
              </a>
            </div>
          </div>

          {/* 오른쪽 연락처 카드 */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <ul className="space-y-3 text-sm text-white">
              <li>📧 <a href="mailto:soilabcoop@gmail.com" className="hover:underline">soilabcoop@gmail.com</a></li>
              <li>🌐 <a href="https://www.soilab-youth.kr" className="hover:underline">
                www.soilab-youth.kr
              </a></li>
              <li>📍 대구광역시 북구 대현로 3, 2층(대현동)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

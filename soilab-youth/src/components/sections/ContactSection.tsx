import Link from 'next/link';
import { youthBusinessInquiryHref } from '@/data/institution-inquiry';
import { familyInquiryHref } from '@/data/family-livinglab';

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
              필요한 활동과 운영 기간, 예산에 맞춰 수행 범위를 협의합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={youthBusinessInquiryHref()}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#fff', color: '#46549C' }}
              >
                청년지원 사업 운영 문의
              </a>
              <a href={familyInquiryHref()} className="rounded-lg border border-white/50 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">가족지원 리빙랩 도입 문의</a>
            </div>
            <Link href="/partnership" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline underline-offset-4">기관 협력 범위와 절차 보기 →</Link>
            <p className="mt-5 text-xs leading-6 text-white/85">청년·가족의 참여 문의는 <a href="https://bridge.soilab-youth.kr/#youth-projects" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">현재 사업 운영 안내</a>에서 대상과 모집 여부를 확인해 주세요.</p>
          </div>

          {/* 오른쪽 연락처 카드 */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <ul className="space-y-3 text-sm text-white">
              <li>📧 <a href="mailto:soilabcoop@gmail.com" className="hover:underline">soilabcoop@gmail.com</a></li>
              <li>☎ <a href="tel:053-941-9003" className="hover:underline">053-941-9003</a></li>
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

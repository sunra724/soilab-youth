import Link from 'next/link';
import { youthBusinessInquiryHref } from '@/data/institution-inquiry';

export default function InstitutionServicesSection() {
  return (
    <section id="institution-services" aria-labelledby="institution-services-title" className="scroll-mt-20 bg-[#F6F7FB] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold tracking-wide text-navy">지자체 · 청년센터 · 복지기관의 사업 담당자에게</p>
        <h2 id="institution-services-title" className="mt-4 break-keep text-2xl font-bold text-gray-950 sm:text-3xl">지역의 청년지원 사업을 함께 설계하고 운영합니다</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">청년을 만나는 과정부터 활동 운영과 지역 자원 연결까지, 기관이 필요한 수행 범위를 함께 정합니다. 현재 사업 단계에 맞는 경로를 골라주세요.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold text-forest">기존 청년지원 수행 경험을 바탕으로 협의</p>
            <h3 className="mt-3 text-xl font-bold text-navy">청년지원 사업 기획·운영</h3>
            <p className="mt-4 text-sm leading-7 text-gray-600">지역 청년을 만나고 일상회복·사회연결 활동을 운영할 수행 파트너가 필요할 때 상담합니다.</p>
            <dl className="mt-5 space-y-4 text-sm leading-7">
              <div><dt className="font-bold text-gray-900">소이랩과 협의할 일</dt><dd className="text-gray-600">지역·대상에 맞는 사업 구성, 참여 흐름과 활동 운영, 유관기관 연계와 기록</dd></div>
              <div><dt className="font-bold text-gray-900">남길 결과물</dt><dd className="text-gray-600">운영계획 · 활동 기록 · 참여 집계 · 연계 현황 · 결과보고</dd></div>
            </dl>
            <a href="#stats" className="mb-5 mt-5 text-sm font-bold text-navy hover:underline">2025년 공개 성과와 사례집 확인 →</a>
            <a href={youthBusinessInquiryHref()} className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy-dark">청년지원 사업 운영 문의</a>
          </article>
          <article className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold text-forest">기관 도입을 위한 프로그램 제안</p>
            <h3 className="mt-3 text-xl font-bold text-navy">청년·가족지원 리빙랩</h3>
            <p className="mt-4 text-sm leading-7 text-gray-600">가족 교육과 함께, 생활 속에서 사용할 지원 도구를 당사자와 만들고 시험하는 사업을 검토할 때 살펴봅니다.</p>
            <dl className="mt-5 space-y-4 text-sm leading-7">
              <div><dt className="font-bold text-gray-900">협의할 기본안</dt><dd className="text-gray-600">12주 운영 · 가족과 청년의 공동설계 · 생활 실험 두 차례 · 종료 후 점검</dd></div>
              <div><dt className="font-bold text-gray-900">남길 결과물</dt><dd className="text-gray-600">공동 문제정의서 · 가족지원 도구 · 실험 기록 · 기관 운영 가이드</dd></div>
            </dl>
            <p className="mb-5 mt-5 text-xs leading-6 text-gray-500">기간과 활동은 협의안이며, 기존 사업의 성과와 구분합니다.</p>
            <Link href="/livinglab/family#packages" className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy-dark">도입 범위와 기관 문의 보기</Link>
          </article>
        </div>
      </div>
    </section>
  );
}

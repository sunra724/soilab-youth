import Link from 'next/link';
import { familyLivingLab } from '@/data/family-livinglab';

export default function FamilyLivingLabPreview() {
  return (
    <section aria-labelledby="family-preview-title" className="bg-[#F3F6F4] py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-wider text-forest">가족지원 리빙랩 · 기관 도입 제안</p>
          <h2 id="family-preview-title" className="mt-4 break-keep text-2xl font-bold leading-snug text-gray-950 sm:text-3xl">
            가족과 청년이 함께 만드는<br className="hidden sm:block" /> 일상 속 회복의 방법
          </h2>
          <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-gray-600">
            가족과 청년의 이야기를 듣고, 연락·대화·도움 요청의 방법을 함께 설계합니다.
            일상에서 두 차례 시험하고 개선한 도구와 운영 방법을 지역기관에 연결합니다.
          </p>
          <Link href={familyLivingLab.path} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
            가족지원 리빙랩 도입안 보기 <span aria-hidden="true" className="ml-3">→</span>
          </Link>
        </div>
        <dl className="grid grid-cols-3 gap-3 border-y border-green/20 py-6">
          {familyLivingLab.summary.map(item => (
            <div key={item.value}>
              <dt className="break-keep text-xs leading-5 text-gray-600">{item.label}</dt>
              <dd className="mt-3 text-xl font-bold text-navy sm:text-2xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

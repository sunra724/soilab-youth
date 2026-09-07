import type { PartnerType } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

export default function PartnerEcosystem({ partners }: { partners: PartnerType[] }) {
  return (
    <section id="ecosystem" aria-labelledby="ecosystem-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="ecosystem-title"
          eyebrow="LOCAL ECOSYSTEM"
          title="지역에서 함께할 수 있는 역할"
          description="상담, 생활, 주거, 일경험 등 청년에게 필요한 도움을 지역 안에서 연결하기 위한 역할 예시입니다. 실제 협력 범위는 각 실험의 질문과 지역 여건에 맞춰 정합니다."
          centered
        />

        <details className="mt-8 rounded-2xl border border-gray-100 p-6">
          <summary className="cursor-pointer text-sm font-bold text-navy">기관별로 함께할 수 있는 일 살펴보기</summary>
        <div className="relative mt-6">
          <div aria-hidden="true" className="absolute inset-x-24 top-1/2 hidden h-px bg-navy/10 lg:block" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner, index) => (
              <article key={partner.title} className="relative rounded-2xl border border-gray-100 bg-cream p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-navy shadow-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-bold text-gray-950">{partner.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{partner.role}</p>
              </article>
            ))}
          </div>
        </div>
        </details>
      </div>
    </section>
  );
}

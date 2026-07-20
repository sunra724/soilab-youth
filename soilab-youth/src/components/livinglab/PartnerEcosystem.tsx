import type { PartnerType } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

export default function PartnerEcosystem({ partners }: { partners: PartnerType[] }) {
  return (
    <section id="ecosystem" aria-labelledby="ecosystem-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="ecosystem-title"
          eyebrow="LOCAL ECOSYSTEM"
          title="지역 협력 생태계"
          description="특정 기관과의 협력을 과장하지 않고, 지역에서 필요한 역할과 연결 구조를 먼저 보여줍니다. 실제 로고는 사용승인을 마친 뒤 등록합니다."
          centered
        />

        <div className="relative mt-10">
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
      </div>
    </section>
  );
}

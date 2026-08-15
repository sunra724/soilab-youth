import SectionHeading from './SectionHeading';

interface OverviewItem {
  label: string;
  text: string;
}

export default function OverviewCards({ items }: { items: OverviewItem[] }) {
  return (
    <section id="overview" aria-labelledby="overview-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="overview-title"
          eyebrow="AT A GLANCE"
          title="사업 한눈에 보기"
          description="발견에서 끝나지 않고, 연결을 넘어 회복까지 실증합니다. 현장의 변화와 학습을 데이터와 사례로 기록합니다."
          centered
        />
        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-cream p-6">
              <dt className="flex items-center gap-3 text-sm font-bold text-navy">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.label}
              </dt>
              <dd className="mt-4 text-sm leading-7 text-gray-600">{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

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
          title="리빙랩은 일상에서 함께 방법을 찾는 과정입니다"
          description="청년이 겪는 불편과 원하는 변화를 듣고, 청년·가족·실무자가 함께 작은 시도를 설계합니다. 시도해 본 경험을 나누며 지원 방식을 다듬는 것이 소이랩이 지향하는 리빙랩입니다."
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

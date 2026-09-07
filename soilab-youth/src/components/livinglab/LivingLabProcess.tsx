import type { LivingLabStep } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

export default function LivingLabProcess({ steps }: { steps: LivingLabStep[] }) {
  return (
    <section id="method" aria-labelledby="method-title" className="scroll-mt-32 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="method-title"
          eyebrow="METHOD"
          title="질문을 함께 실험하는 과정"
          description="청년의 경험을 듣고, 시도할 방법과 살펴볼 변화를 함께 정합니다. 실행하면서 알게 된 점에 따라 앞의 질문으로 돌아가거나 방법을 바꿀 수 있습니다."
          centered
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li key={step.id}>
              <details className="group h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" open={step.order === 1}>
                <summary className="min-h-11 cursor-pointer list-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                      {step.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
                    </div>
                    <span aria-hidden="true" className="mt-1 text-xl text-navy transition-transform group-open:rotate-45">+</span>
                  </div>
                </summary>
                <div className="ml-14 mt-5 border-t border-gray-100 pt-4 text-sm">
                  <p className="font-bold text-gray-800">주요 활동</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">
                    {step.activities.map((activity) => <li key={activity}>{activity}</li>)}
                  </ul>
                  <p className="mt-4 font-bold text-gray-800">함께 남길 기록</p>
                  <p className="mt-2 text-gray-600">{step.deliverables.join(' · ')}</p>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

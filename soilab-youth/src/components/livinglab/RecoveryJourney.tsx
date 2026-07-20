import type { RecoveryStep } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

export default function RecoveryJourney({ steps }: { steps: RecoveryStep[] }) {
  return (
    <section id="recovery" aria-labelledby="recovery-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="recovery-title"
          eyebrow="RECOVERY JOURNEY"
          title="단계별 일상회복 모델"
          description="회복은 한 방향으로 빠르게 진행되지 않습니다. 청년의 속도와 선택을 존중하며 반복하고, 멈추고, 다시 시작할 수 있도록 지원합니다."
        />

        <ol className="relative mt-10 space-y-4 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-navy/20 md:grid md:grid-cols-5 md:gap-3 md:space-y-0 md:before:left-10 md:before:right-10 md:before:top-5 md:before:h-px md:before:w-auto">
          {steps.map((step) => (
            <li key={step.id} className="relative flex gap-4 md:block">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-navy text-sm font-bold text-white shadow-sm">
                {step.order}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-cream p-5 md:mt-5">
                <h3 className="font-bold text-gray-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.state}</p>
                <dl className="mt-4 space-y-3 text-xs">
                  <div>
                    <dt className="font-bold text-navy">센터 개입</dt>
                    <dd className="mt-1 leading-5 text-gray-600">{step.intervention}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-navy">확인 지표</dt>
                    <dd className="mt-1 leading-5 text-gray-600">{step.indicators.join(' · ')}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-green/20 bg-green/5 p-6">
          <p className="text-sm font-bold text-green-dark">모든 단계에 가족지원을 병행합니다.</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            가족 안내와 상담은 당사자의 선택과 개인정보를 존중하는 별도 축으로 운영합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

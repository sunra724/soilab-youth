import type { RecoveryStep } from '@/data/livinglab';
import Link from 'next/link';
import SectionHeading from './SectionHeading';

export default function RecoveryJourney({ steps }: { steps: RecoveryStep[] }) {
  return (
    <section id="recovery" aria-labelledby="recovery-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="recovery-title"
          eyebrow="RECOVERY JOURNEY"
          title="회복 과정에서 함께 살펴볼 변화"
          description="아래는 일상과 관계의 변화를 살펴보기 위한 영역입니다. 정해진 순서나 평가 점수로 사용하지 않고, 본인이 원하는 변화부터 함께 이야기합니다."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <li key={step.id}>
              <div className="h-full rounded-2xl border border-gray-100 bg-cream p-5">
                <h3 className="font-bold text-gray-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.state}</p>
                <dl className="mt-4 space-y-3 text-xs">
                  <div>
                    <dt className="font-bold text-navy">지원 방법의 예</dt>
                    <dd className="mt-1 leading-5 text-gray-600">{step.intervention}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-navy">기록해 볼 내용</dt>
                    <dd className="mt-1 leading-5 text-gray-600">{step.indicators.join(' · ')}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-green/20 bg-green/5 p-6">
          <p className="text-sm font-bold text-green-dark">청년과 가족에게 필요한 도움을 함께 살핍니다.</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            가족 자신의 상담 필요와 청년의 의사를 각각 확인하고, 상황에 맞는 지원을 검토합니다.
          </p>
          <Link href="/research/notes/everyday-recovery-outcomes" className="mt-4 inline-block text-sm font-semibold text-navy underline underline-offset-4">일상과 관계의 회복을 기록하는 연구노트 →</Link>
        </div>
      </div>
    </section>
  );
}

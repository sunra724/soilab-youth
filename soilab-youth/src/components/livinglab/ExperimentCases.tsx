import type { ExperimentCase } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

export default function ExperimentCases({ cases }: { cases: ExperimentCase[] }) {
  return (
    <section id="experiments" aria-labelledby="experiments-title" className="scroll-mt-32 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="experiments-title"
          eyebrow="FIELD EXPERIMENTS"
          title="실증사례"
          description="개인의 서사보다 문제·가설·공동설계·실험·측정·개선의 학습 과정을 공개합니다. 공개 승인을 마친 사례만 표시합니다."
        />

        {cases.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">공개 검토 중</span>
            <h3 className="mt-4 text-lg font-bold text-gray-900">승인된 공개 실증사례를 준비하고 있습니다.</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              참여자 동의와 소수집단 추정 위험을 확인한 뒤, 서비스 변화와 현장 학습 중심으로 공개합니다.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold text-navy">{item.status === 'completed' ? '실증 완료' : '실증 진행'}</span>
                <h3 className="mt-2 text-lg font-bold text-gray-950">{item.title}</h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="font-bold text-gray-800">문제</dt><dd className="mt-1 leading-6 text-gray-600">{item.problem}</dd></div>
                  <div><dt className="font-bold text-gray-800">가설</dt><dd className="mt-1 leading-6 text-gray-600">{item.hypothesis}</dd></div>
                  <div><dt className="font-bold text-gray-800">실험</dt><dd className="mt-1 leading-6 text-gray-600">{item.prototype}</dd></div>
                  <div><dt className="font-bold text-gray-800">결과</dt><dd className="mt-1 leading-6 text-gray-600">{item.result ?? '데이터 승인 후 입력'}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

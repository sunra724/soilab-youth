import type { ExperimentCase } from '@/data/livinglab';
import Link from 'next/link';
import SectionHeading from './SectionHeading';

export default function ExperimentCases({ cases }: { cases: ExperimentCase[] }) {
  return (
    <section id="experiments" aria-labelledby="experiments-title" className="scroll-mt-32 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="experiments-title"
          eyebrow="FIELD EXPERIMENTS"
          title="실험에서 남길 기록과 배움"
          description="함께 정한 질문부터 시도한 방법, 참여자가 느낀 변화와 다음 개선까지 이어지는 기록을 지향합니다. 예상과 달랐던 점도 다음 시도를 위한 배움으로 남깁니다."
        />

        {cases.length === 0 ? (
          <div className="mt-10">
            <p className="max-w-3xl text-sm leading-7 text-gray-600">현재 공개된 개별 실험 기록은 없습니다. 아래는 앞으로 실험을 돌아볼 때 사용할 기록 항목입니다. 실제 사례는 참여자의 동의와 공개 범위를 확인한 뒤 추가합니다.</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['함께 정한 질문', '무엇이 어려웠고, 어떤 변화를 원했나요?'],
                ['시도한 방법', '누가 어떤 방식으로 참여하고 조정했나요?'],
                ['확인한 변화', '편해진 점과 여전히 어려운 점은 무엇인가요?'],
                ['배운 점과 다음 시도', '계속할 것과 바꿀 것은 무엇인가요?'],
              ].map(([title, question]) => <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6"><dt className="text-sm font-bold text-navy">{title}</dt><dd className="mt-3 text-sm leading-7 text-gray-600">{question}</dd></div>)}
            </dl>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <span className="text-xs font-bold text-navy">{{ planned: '실험 준비', running: '실험 진행', completed: '실험 완료' }[item.status]}</span>
                <h3 className="mt-2 text-lg font-bold text-gray-950">{item.title}</h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="font-bold text-gray-800">문제</dt><dd className="mt-1 leading-6 text-gray-600">{item.problem}</dd></div>
                  <div><dt className="font-bold text-gray-800">가설</dt><dd className="mt-1 leading-6 text-gray-600">{item.hypothesis}</dd></div>
                  <div><dt className="font-bold text-gray-800">실험</dt><dd className="mt-1 leading-6 text-gray-600">{item.prototype}</dd></div>
                  {item.duration && <div><dt className="font-bold text-gray-800">진행 기간</dt><dd className="mt-1 leading-6 text-gray-600">{item.duration}</dd></div>}
                  <div><dt className="font-bold text-gray-800">확인한 변화</dt><dd className="mt-1 leading-6 text-gray-600">{item.result ?? '아직 공개된 결과가 없습니다.'}</dd></div>
                  {item.learning && <div><dt className="font-bold text-gray-800">배운 점</dt><dd className="mt-1 leading-6 text-gray-600">{item.learning}</dd></div>}
                  {item.nextIteration && <div><dt className="font-bold text-gray-800">다음 시도</dt><dd className="mt-1 leading-6 text-gray-600">{item.nextIteration}</dd></div>}
                </dl>
              </article>
            ))}
          </div>
        )}
        <div id="outcomes" className="mt-8 grid scroll-mt-32 gap-4 sm:grid-cols-2">
          <Link href="/research" className="rounded-2xl border border-navy/15 bg-white p-6 transition-colors hover:border-navy"><h3 className="font-bold text-navy">질문을 뒷받침하는 정책·연구 →</h3><p className="mt-2 text-sm leading-7 text-gray-600">실험을 설계할 때 참고할 원문 근거와 적용 한계를 읽습니다.</p></Link>
          <Link href="/#stats" className="rounded-2xl border border-navy/15 bg-white p-6 transition-colors hover:border-navy"><h3 className="font-bold text-navy">센터의 활동과 성과 →</h3><p className="mt-2 text-sm leading-7 text-gray-600">센터가 홈페이지에 공개한 활동과 성과를 확인합니다.</p></Link>
        </div>
      </div>
    </section>
  );
}

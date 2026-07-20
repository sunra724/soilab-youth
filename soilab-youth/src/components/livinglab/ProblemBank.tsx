'use client';

import { useMemo, useState } from 'react';
import type { EvidenceLevel, ProblemCard } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  hypothesis: '실증 가설',
  observed: '현장 관찰',
  validated: '검증 완료',
};

interface ProblemBankProps {
  categories: readonly string[];
  problems: ProblemCard[];
}

export default function ProblemBank({ categories, problems }: ProblemBankProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const filteredProblems = useMemo(
    () =>
      selectedCategory === '전체'
        ? problems
        : problems.filter((problem) => problem.category === selectedCategory),
    [problems, selectedCategory],
  );

  return (
    <section id="problem-bank" aria-labelledby="problem-bank-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="problem-bank-title"
          eyebrow="PROBLEM BANK"
          title="고립·은둔청년 문제은행"
          description="개인의 문제가 아니라, 지원에 도달하기 어렵게 만드는 지역의 장벽을 찾습니다. 상담기록이나 개인 사례가 아닌 서비스 장벽·실증 가설·개선 방향을 구조화한 데이터입니다."
        />

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="문제은행 분류 필터">
          {categories.map((category) => {
            const selected = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                  selected
                    ? 'border-navy bg-navy text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-navy/40 hover:text-navy'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-sm text-gray-500" aria-live="polite" aria-atomic="true">
          {selectedCategory} 분류 {filteredProblems.length}건
        </p>

        {filteredProblems.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-cream px-6 py-12 text-center">
            <p className="font-semibold text-gray-700">이 분류의 공개 승인 문제카드가 아직 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">다른 분류를 선택해 주세요.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProblems.map((problem) => (
              <article key={problem.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue/10 px-2.5 py-1 text-xs font-bold text-blue-dark">
                    {problem.category}
                  </span>
                  <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {EVIDENCE_LABELS[problem.evidenceLevel]}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-7 text-gray-950">{problem.title}</h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="font-bold text-gray-800">발견한 장벽</dt>
                    <dd className="mt-1 leading-6 text-gray-600">{problem.barrier}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-gray-800">당사자 관점의 요구</dt>
                    <dd className="mt-1 leading-6 text-gray-600">{problem.userNeed}</dd>
                  </div>
                </dl>
                <details className="mt-5 border-t border-gray-100 pt-3">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
                    가설과 측정 방법 보기
                  </summary>
                  <dl className="space-y-4 pb-1 pt-3 text-sm">
                    <div>
                      <dt className="font-bold text-gray-800">실증 가설</dt>
                      <dd className="mt-1 leading-6 text-gray-600">{problem.hypothesis}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-800">프로토타입</dt>
                      <dd className="mt-1 leading-6 text-gray-600">{problem.prototype}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-800">측정지표</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {problem.metrics.map((metric) => (
                          <span key={metric} className="rounded-md bg-cream px-2 py-1 text-xs text-gray-600">
                            {metric}
                          </span>
                        ))}
                      </dd>
                    </div>
                    {problem.nextAction && (
                      <div>
                        <dt className="font-bold text-gray-800">다음 개선</dt>
                        <dd className="mt-1 leading-6 text-gray-600">{problem.nextAction}</dd>
                      </div>
                    )}
                  </dl>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

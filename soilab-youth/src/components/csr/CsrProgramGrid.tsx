'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CsrProgram } from '@/data/csr';

const FILTERS = ['전체', '일상회복', '지역연결', '지역상생', '사회참여'];

export default function CsrProgramGrid({ programs }: { programs: CsrProgram[] }) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const filteredPrograms = useMemo(
    () =>
      activeFilter === '전체'
        ? programs
        : programs.filter((program) => program.categories.includes(activeFilter)),
    [activeFilter, programs],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" aria-label="CSR 프로그램 분야 필터">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === filter
                ? 'border-[#2F6B57] bg-[#2F6B57] text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#2F6B57] hover:text-[#2F6B57]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-live="polite">
        {filteredPrograms.map((program, index) => (
          <article
            key={program.slug}
            className="group overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_16px_45px_rgba(38,51,46,0.07)] transition-transform hover:-translate-y-1"
          >
            <div className="p-6 sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{ background: program.softColor, color: program.color }}
                >
                  {program.status === 'operational' ? '참여 서비스 운영형' : 'CSR 제안 프로그램'}
                </span>
                <span className="text-sm font-bold text-gray-300" aria-hidden="true">
                  0{index + 1}
                </span>
              </div>

              <p className="mb-2 text-sm font-bold" style={{ color: program.color }}>
                {program.eyebrow}
              </p>
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-gray-950">{program.title}</h3>
              <p className="min-h-20 text-[15px] leading-7 text-gray-600">{program.summary}</p>

              <dl className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-[#F8F7F2] p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="mb-1 text-xs font-bold text-gray-400">참여 대상</dt>
                  <dd className="font-medium text-gray-700">{program.audience}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-bold text-gray-400">운영 구조</dt>
                  <dd className="font-medium text-gray-700">{program.duration}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                {program.outcomes.map((outcome) => (
                  <span key={outcome} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
                    {outcome}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-5 sm:px-8">
              <span className="text-xs text-gray-400">
                {program.status === 'operational' ? '초대코드로 안전하게 참여' : '기업별 맞춤 설계 가능'}
              </span>
              {program.status === 'operational' ? (
                <Link
                  href="/csr/morning-challenge"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#2F6B57] hover:underline"
                >
                  자세히 보기 <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <a
                  href={`mailto:soilabcoop@gmail.com?subject=${encodeURIComponent(
                    `[CSR 제안 문의] ${program.title}`,
                  )}`}
                  className="inline-flex items-center gap-2 text-sm font-bold hover:underline"
                  style={{ color: program.color }}
                >
                  제안 문의 <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

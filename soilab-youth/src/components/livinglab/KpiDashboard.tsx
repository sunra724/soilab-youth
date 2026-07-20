import type { KpiItem } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

interface KpiDashboardProps {
  publicKpis: KpiItem[];
  pendingKpis: KpiItem[];
  stages: string[];
  dataNote: string;
  updatedAt: string;
}

export default function KpiDashboard({
  publicKpis,
  pendingKpis,
  stages,
  dataNote,
  updatedAt,
}: KpiDashboardProps) {
  const visibleItems = publicKpis.length > 0 ? publicKpis : pendingKpis;

  return (
    <section id="outcomes" aria-labelledby="outcomes-title" className="scroll-mt-32 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="outcomes-title"
          eyebrow="OUTCOMES"
          title="실증·성과 대시보드"
          description="공개 승인을 마친 익명 집계만 표시합니다. 0은 실제 집계값으로, 미입력값은 검증 대기 상태로 구분합니다."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const isPublic = item.status === 'approved' && item.value !== null;
            return (
              <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isPublic ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isPublic ? '공개 승인' : '검증 대기'}
                  </span>
                </div>
                {isPublic ? (
                  <p className="mt-5 text-4xl font-bold text-navy">
                    {item.value?.toLocaleString('ko-KR')}
                    <span className="ml-1 text-xl">{item.unit}</span>
                  </p>
                ) : (
                  <p className="mt-5 text-lg font-bold text-gray-500">데이터 검증 후 공개</p>
                )}
                <p className="mt-4 text-xs leading-6 text-gray-500">{item.definition}</p>
                <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  기준기간: {isPublic ? item.period : '내부 승인 후 입력'}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
          <h3 className="text-base font-bold text-gray-900">발견부터 사회참여까지의 성과 흐름</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            단계별 수치는 정의·분모·중복 기준의 공개 승인 후 연결합니다.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-5" aria-label="성과 흐름 단계">
            {stages.map((stage, index) => (
              <li key={stage} className="relative rounded-xl bg-cream px-4 py-5 text-center">
                <span className="block text-xs font-bold text-navy">STEP {index + 1}</span>
                <span className="mt-1 block text-sm font-semibold text-gray-800">{stage}</span>
              </li>
            ))}
          </ol>
        </div>

        <details className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
          <summary className="min-h-11 cursor-pointer py-2 font-bold text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy">
            데이터 공개 기준 확인
          </summary>
          <div className="pb-2 pt-3 leading-7">
            <p>{dataNote}</p>
            <p className="mt-2">최종 업데이트: {updatedAt}</p>
            <p className="mt-2">
              공개 데이터에는 개인정보·상담기록·개인별 위험도·세부 거주정보를 포함하지 않으며, 소수집단 추정 위험이 있는 값은 공개하지 않습니다.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}

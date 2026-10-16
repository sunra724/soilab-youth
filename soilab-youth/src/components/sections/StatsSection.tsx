import { getStatsList } from '@/lib/notion';
import type { StatItem } from '@/types/notion';

const DEFAULT_STATS: StatItem[] = [
  { id: '1', name: '총 발굴 쉼청년', value: 132, unit: '명',  description: '2025년 발굴 인원 · 등록 인원과 구분' },
  { id: '2', name: '프로그램 이수율', value: 100, unit: '%',  description: '2025년 등록자 125명 전원 이수' },
  { id: '3', name: '협력 유관기관',  value: 25,  unit: '개',  description: '지역 네트워크' },
  { id: '4', name: '사회 진입 연계 비율', value: 52, unit: '%', description: '취업 20명 · 창업 2명 · 직업훈련 연계 43명 포함' },
];

export default async function StatsSection() {
  const stats = await getStatsList();
  const items = stats.length > 0 ? stats : DEFAULT_STATS;

  return (
    <section id="stats" className="py-20" style={{ background: '#46549C' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <p
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-4"
            style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.24)', background: 'rgba(255,255,255,0.08)' }}
          >
            2025년 성과
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">숫자로 보는 소이랩의 발걸음</h2>
          <p className="mt-3 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
            아래 지표는 2025년 고립·은둔 청년 지원사업 기준이며, 2026년 성과는 사업 종료 시점에 보충 예정입니다.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div className="text-4xl font-bold text-white">
                {stat.value.toLocaleString()}<span className="text-xl">{stat.unit}</span>
              </div>
              <div className="mt-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {stat.name}
              </div>
              {stat.description && (
                <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-7 text-center text-xs leading-6 text-white/80">발굴 인원과 등록 인원을 구분해 확인해 주세요. <a href="https://forms.gle/ADcNkuMBENKfyuEi8" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">2025년 성과 사례집 열람 안내 ↗</a></p>
      </div>
    </section>
  );
}

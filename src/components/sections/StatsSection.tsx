import { getStatsList } from '@/lib/notion';
import type { StatItem } from '@/types/notion';

const DEFAULT_STATS: StatItem[] = [
  { id: '1', name: '총 발굴 쉼청년', value: 132, unit: '명',  description: '2025년 기준' },
  { id: '2', name: '프로그램 이수율', value: 100, unit: '%',  description: '전원 완료' },
  { id: '3', name: '협력 유관기관',  value: 25,  unit: '개',  description: '지역 네트워크' },
  { id: '4', name: '사회 진입 성공률', value: 52, unit: '%', description: '취업·복학 등' },
];

export default async function StatsSection() {
  const stats = await getStatsList();
  const items = stats.length > 0 ? stats : DEFAULT_STATS;

  return (
    <section id="stats" className="py-20" style={{ background: '#46549C' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">숫자로 보는 소이랩의 발걸음</h2>
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
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CardNewsCard from '@/components/ui/CardNewsCard';
import CardNewsFilter from './CardNewsFilter';
import { pageMetadata } from '@/lib/metadata';
import { getCardNewsList } from '@/lib/notion';

export const metadata: Metadata = pageMetadata({
  path: '/cardnews',
  title: '소식 & 카드뉴스',
  description: '소이랩의 청년지원 사업 소식과 고립·은둔 청년을 이해하는 정보를 전합니다.',
});

export default async function CardNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; project?: string }>;
}) {
  const { category, project } = await searchParams;
  const allItems = await getCardNewsList();

  const filtered = allItems.filter((item) => {
    if (category && category !== '전체' && item.category !== category) return false;
    if (project && project !== '전체' && item.project !== project) return false;
    return true;
  });

  return (
    <>
      <Header />
      <main>
        {/* 히어로 바 */}
        <div className="py-14" style={{ background: '#46549C' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-white mb-2">소식 &amp; 카드뉴스</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              소이랩의 청년지원 사업 소식과 고립·은둔 청년을 이해하는 정보를 전합니다.
            </p>
          </div>
        </div>

        {/* 필터 + 목록 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <aside className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-6">
            <p className="text-xs font-bold tracking-wide text-indigo-700">SOILAB STORIES</p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">청년의 회복·일경험·지역 정착, 주제별로 읽기</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">SNS에서 나눈 12건의 원고와 카드를 세 개의 연재로 모았습니다.</p>
            <Link href="/series" className="mt-3 inline-block text-sm font-bold text-indigo-800">소이랩 연재 전체 보기 →</Link>
          </aside>
          <CardNewsFilter
            currentCategory={category ?? '전체'}
            currentProject={project ?? '전체'}
          />

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              아직 등록된 소식이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
              {filtered.map((item) => (
                <CardNewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

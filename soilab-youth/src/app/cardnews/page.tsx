import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CardNewsCard from '@/components/ui/CardNewsCard';
import CardNewsFilter from './CardNewsFilter';
import { getCardNewsList } from '@/lib/notion';

export const metadata: Metadata = {
  title: '소식 & 카드뉴스',
  description: '청년 다다름 사업의 최신 카드뉴스와 소이랩 활동 소식입니다.',
};

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
              청년 다다름 사업의 카드뉴스와 소이랩 활동 소식입니다.
            </p>
          </div>
        </div>

        {/* 필터 + 목록 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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

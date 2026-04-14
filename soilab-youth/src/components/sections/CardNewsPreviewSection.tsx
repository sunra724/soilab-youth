import Link from 'next/link';
import { getCardNewsList } from '@/lib/notion';
import CardNewsCard from '@/components/ui/CardNewsCard';
import type { CardNews } from '@/types/notion';

const SAMPLE_ITEMS: CardNews[] = [
  { id: 'sample-1', title: '고립·은둔 청년을 이해하는 5가지 방법', category: '카드뉴스', project: '고립은둔청년', publishedAt: '2025-01-01', thumbnailColor: 'navy', summary: '은둔 청년을 이해하고 연결하는 실천적 방법들을 소개합니다.', externalUrl: '' },
  { id: 'sample-2', title: '2025 청년 다다름 네트워킹 데이 후기', category: '활동소식', project: '청년다다름', publishedAt: '2025-01-01', thumbnailColor: 'green', summary: '청년들이 서로를 발견하는 네트워킹 현장을 담았습니다.', externalUrl: '' },
  { id: 'sample-3', title: '부모님이 알아야 할 자녀 고립 신호 7가지', category: '카드뉴스', project: '고립은둔청년', publishedAt: '2024-12-01', thumbnailColor: 'blue', summary: '가족이 먼저 알아차릴 수 있는 징후들을 정리했습니다.', externalUrl: '' },
];

export default async function CardNewsPreviewSection() {
  const items = await getCardNewsList();
  const displayed = (items.length > 0 ? items : SAMPLE_ITEMS).slice(0, 6);

  return (
    <section id="cardnews" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: '#46549C' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">소식 &amp; 카드뉴스</h2>
          <p className="text-gray-500 text-sm mt-2">청년 다다름 사업의 최신 카드뉴스와 소이랩 활동 소식입니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {displayed.map((item) => (
            <CardNewsCard key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/cardnews"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-6 py-3 rounded-lg border transition-colors"
            style={{ borderColor: '#46549C', color: '#46549C' }}
          >
            더 많은 소식 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}

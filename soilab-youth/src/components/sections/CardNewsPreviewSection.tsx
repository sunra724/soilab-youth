import Link from 'next/link';
import { getCardNewsList } from '@/lib/notion';
import CardNewsCard from '@/components/ui/CardNewsCard';

export default async function CardNewsPreviewSection() {
  const items = await getCardNewsList();
  const displayed = items.slice(0, 6);

  return (
    <section id="cardnews" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: '#46549C' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">소식 &amp; 카드뉴스</h2>
          <p className="text-gray-500 text-sm mt-2">소이랩의 청년지원 사업 소식과 고립·은둔 청년을 이해하는 정보를 전합니다.</p>
        </div>

        {displayed.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {displayed.map((item) => (
            <CardNewsCard key={item.id} item={item} />
          ))}
        </div> : <p className="rounded-2xl bg-gray-50 px-6 py-10 text-center text-sm leading-7 text-gray-600">현재 표시할 소식이 없습니다. 사업별 운영 안내는 <Link href="/#programs" className="font-semibold text-navy underline underline-offset-4">주요 사업</Link>에서 확인해 주세요.</p>}

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

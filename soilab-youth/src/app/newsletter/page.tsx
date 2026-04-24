import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getNewsletterList } from '@/lib/notion';
import { formatDate } from '@/lib/utils';
import NewsletterSubscribeForm from './NewsletterSubscribeForm';

export const metadata: Metadata = {
  title: '뉴스레터',
  description: '매일 뉴스클리핑과 소이랩 고립·은둔 청년 지원센터의 기관 소식을 전합니다.',
};

type NewsletterItem = Awaited<ReturnType<typeof getNewsletterList>>[number];

function isNewsClipping(item: NewsletterItem) {
  return item.title.includes('뉴스클리핑')
    || item.summary.includes('주요 카테고리:')
    || item.summary.includes('주요 뉴스');
}

function NewsletterList({
  items,
  emptyText,
  badge,
  badgeColor,
}: {
  items: NewsletterItem[];
  emptyText: string;
  badge: string;
  badgeColor: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-8">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {items.map((item) => (
        <div key={item.id} className="py-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white"
            style={{ background: badgeColor }}
          >
            {badge}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
            <div className="text-xs text-gray-400 mt-0.5">
              {item.publishedAt ? formatDate(item.publishedAt) : '발행일 준비 중'}
            </div>
            {item.summary && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
            )}
          </div>

          {item.pdfUrl && (
            <a
              href={item.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-sm px-4 py-2 rounded-lg border font-semibold transition-colors"
              style={{ borderColor: badgeColor, color: badgeColor }}
            >
              PDF 보기
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function NewsletterPage() {
  const items = await getNewsletterList();
  const newsClippings = items.filter(isNewsClipping);
  const centerLetters = items.filter((item) => !isNewsClipping(item));

  return (
    <>
      <Header />
      <main>
        <div className="py-14" style={{ background: '#248DAC' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-white mb-2">뉴스레터</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              매일 뉴스클리핑과 소이랩 고립·은둔 청년 지원센터의 기관 소식을 나누어 전합니다.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 mb-10">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-bold text-[#248DAC] mb-2">매일 자동 발송</div>
              <h2 className="text-lg font-bold text-gray-900">다시봄 뉴스클리핑</h2>
              <p className="text-sm text-gray-500 mt-2">
                고립은둔·사회적가치·청년지원 키워드의 주요 뉴스를 매일 오전 8시에 정리해 보냅니다.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-bold text-[#46549C] mb-2">비정기 발송</div>
              <h2 className="text-lg font-bold text-gray-900">센터 기관 소식</h2>
              <p className="text-sm text-gray-500 mt-2">
                소이랩 고립·은둔 청년 지원센터의 활동보고, 안내, 행사 소식을 필요할 때 전합니다.
              </p>
            </div>
          </div>

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs font-bold text-[#248DAC]">NEWS CLIPPING</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">매일 뉴스클리핑</h2>
              </div>
              <p className="text-xs text-gray-400">매일 오전 8시 자동 발송</p>
            </div>
            <NewsletterList
              items={newsClippings}
              emptyText="아직 발행된 뉴스클리핑이 없습니다."
              badge="뉴스"
              badgeColor="#248DAC"
            />
          </section>

          <section className="mt-12">
            <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs font-bold text-[#46549C]">CENTER LETTER</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">기관 소식</h2>
              </div>
              <p className="text-xs text-gray-400">소이랩이 직접 보내는 소식</p>
            </div>
            <NewsletterList
              items={centerLetters}
              emptyText="등록된 기관 소식이 아직 없습니다."
              badge="레터"
              badgeColor="#46549C"
            />
          </section>

          <div className="mt-12 p-6 rounded-2xl" style={{ background: '#F8F9FC' }}>
            <h3 className="font-semibold text-gray-900 mb-2">뉴스레터를 이메일로 받아보세요</h3>
            <p className="text-sm text-gray-500">
              매일 뉴스클리핑과 소이랩 고립·은둔 청년 지원센터의 기관 소식을 함께 받아볼 수 있습니다.
            </p>
            <NewsletterSubscribeForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

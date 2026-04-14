import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getNewsletterList } from '@/lib/notion';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: '뉴스레터',
  description: '소이랩의 활동과 고립·은둔청년 이슈를 정기적으로 전합니다.',
};

export default async function NewsletterPage() {
  const items = await getNewsletterList();

  return (
    <>
      <Header />
      <main>
        {/* 히어로 바 */}
        <div className="py-14" style={{ background: '#248DAC' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-white mb-2">뉴스레터</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              소이랩의 활동과 고립·은둔청년 이슈를 정기적으로 전합니다.
            </p>
          </div>
        </div>

        {/* 목록 */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-20">준비 중입니다.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white"
                       style={{ background: '#46549C' }}>
                    {item.issueNumber}호
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(item.publishedAt)}</div>
                    {item.summary && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                  {item.pdfUrl && (
                    <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer"
                       className="flex-shrink-0 text-sm px-4 py-2 rounded-lg border font-semibold transition-colors"
                       style={{ borderColor: '#46549C', color: '#46549C' }}>
                      PDF 다운로드
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 구독 안내 */}
          <div className="mt-12 p-6 rounded-2xl" style={{ background: '#F8F9FC' }}>
            <h3 className="font-semibold text-gray-900 mb-2">뉴스레터를 이메일로 받아보세요</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>soilabcoop@gmail.com</strong> 으로 &apos;뉴스레터 구독&apos; 제목으로 보내주시면 등록해드립니다.
            </p>
            <a href="mailto:soilabcoop@gmail.com?subject=뉴스레터 구독"
               className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
               style={{ background: '#46549C' }}>
              이메일 보내기 →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

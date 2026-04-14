import Link from 'next/link';
import { getNewsletterList } from '@/lib/notion';
import { formatDate } from '@/lib/utils';

export default async function NewsletterPreviewSection() {
  const items = await getNewsletterList();
  const displayed = items.slice(0, 3);

  return (
    <section id="newsletter" className="py-20" style={{ background: '#F8F9FC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-4">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: '#46549C' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">뉴스레터</h2>
          <p className="text-gray-500 text-sm mt-2">
            소이랩의 활동과 고립·은둔청년 이슈를 담은 뉴스레터를 받아보세요.
          </p>
        </div>

        {displayed.length === 0 ? (
          <p className="text-center text-gray-400 py-12">준비 중입니다.</p>
        ) : (
          <div className="flex flex-col gap-4 mt-8">
            {displayed.map((item) => (
              <div key={item.id}
                   className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white"
                     style={{ background: '#46549C' }}>
                  {item.issueNumber}호
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(item.publishedAt)}</div>
                  {item.summary && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.summary}</div>
                  )}
                </div>
                {item.pdfUrl && (
                  <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer"
                     className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors"
                     style={{ borderColor: '#46549C', color: '#46549C' }}>
                    PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/newsletter"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-6 py-3 rounded-lg border transition-colors"
                style={{ borderColor: '#46549C', color: '#46549C' }}>
            모든 뉴스레터 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}

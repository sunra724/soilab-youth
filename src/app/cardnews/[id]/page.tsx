import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import { getCardNewsDetail } from '@/lib/notion';
import { formatDate, getBgColor, getThemeColor, getThumbnailEmoji } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getCardNewsDetail(id);
  if (!item) return { title: '소식 없음' };
  return {
    title: item.title,
    description: item.summary,
  };
}

function getBadgeColor(category: string): 'navy' | 'blue' | 'green' {
  if (category === '활동소식') return 'green';
  if (category === '공지') return 'blue';
  return 'navy';
}

export default async function CardNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getCardNewsDetail(id);

  if (!item) notFound();

  const bg = getBgColor(item.thumbnailColor);
  const fg = getThemeColor(item.thumbnailColor);
  const emoji = getThumbnailEmoji(item.thumbnailColor);

  const isHtmlEmbed = item.externalUrl?.endsWith('.html');

  return (
    <>
      <Header />
      <main className="py-10">
        {/* 상단 메타 영역 */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link href="/cardnews"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
            ← 목록으로
          </Link>

          {!isHtmlEmbed && (
            <div className="w-full h-48 rounded-2xl flex items-center justify-center text-6xl mb-8"
                 style={{ background: bg, color: fg }}>
              {emoji}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {item.category && <Badge label={item.category} color={getBadgeColor(item.category)} />}
            {item.project && <span className="text-xs text-gray-400">{item.project}</span>}
            <span className="text-xs text-gray-400 ml-auto">{formatDate(item.publishedAt)}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">{item.title}</h1>

          {item.summary && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 p-4 rounded-xl"
               style={{ background: '#F8F9FC' }}>
              {item.summary}
            </p>
          )}
        </div>

        {/* 카드뉴스 HTML 임베드 - 전체 너비 */}
        {isHtmlEmbed ? (
          <div className="w-full px-2 sm:px-4 mt-2 mb-6">
            <iframe
              src={item.externalUrl}
              className="w-full rounded-2xl border border-gray-100"
              style={{ height: '90vh', minHeight: '700px', display: 'block' }}
              title={item.title}
            />
            <div className="max-w-2xl mx-auto px-2 mt-3 flex justify-end">
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                새 탭에서 열기 →
              </a>
            </div>
          </div>
        ) : item.externalUrl ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-10">
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: fg }}
            >
              원본 보기 →
            </a>
          </div>
        ) : null}

        {/* 하단 네비 */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="border-t border-gray-100 pt-8 mt-4">
            <Link
              href="/cardnews"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg border transition-colors"
              style={{ borderColor: '#46549C', color: '#46549C' }}
            >
              다른 소식 보기 →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

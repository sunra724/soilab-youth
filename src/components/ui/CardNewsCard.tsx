import Link from 'next/link';
import type { CardNews } from '@/types/notion';
import { formatDate, getBgColor, getThemeColor, getThumbnailEmoji } from '@/lib/utils';
import Badge from './Badge';

interface Props {
  item: CardNews;
}

function getBadgeColor(category: string): 'navy' | 'blue' | 'green' {
  if (category === '활동소식') return 'green';
  if (category === '공지') return 'blue';
  return 'navy';
}

export default function CardNewsCard({ item }: Props) {
  const bg = getBgColor(item.thumbnailColor);
  const fg = getThemeColor(item.thumbnailColor);
  const emoji = getThumbnailEmoji(item.thumbnailColor);

  return (
    <Link
      href={`/cardnews/${item.id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden
                 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* 썸네일 */}
      <div
        className="h-40 flex items-center justify-center text-5xl"
        style={{ background: bg }}
      >
        <span style={{ color: fg }}>{emoji}</span>
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {item.category && (
            <Badge label={item.category} color={getBadgeColor(item.category)} />
          )}
          {item.project && (
            <span className="text-xs text-gray-400">{item.project}</span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-navy transition-colors">
          {item.title || '제목 없음'}
        </h3>

        {item.summary && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.summary}</p>
        )}

        <div className="mt-auto pt-2 text-xs text-gray-400">
          {formatDate(item.publishedAt)}
        </div>
      </div>
    </Link>
  );
}

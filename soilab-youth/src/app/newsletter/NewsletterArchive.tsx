'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Newsletter } from '@/types/notion';
import { formatDate } from '@/lib/utils';

const PAGE_SIZE = 20;

function monthLabel(value: string) {
  const date = new Date(`${value}T00:00:00+09:00`);
  return Number.isNaN(date.getTime())
    ? '발행일 미정'
    : new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      timeZone: 'Asia/Seoul',
    }).format(date);
}

function groupByMonth(items: Newsletter[]) {
  const groups = new Map<string, Newsletter[]>();
  for (const item of items) {
    const key = monthLabel(item.publishedAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}

export default function NewsletterArchive({ items }: { items: Newsletter[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleItems = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
        기존 자동발송 회차는 새 공개 기준을 충족하지 않아 비공개했습니다.
        기준을 통과해 새로 발송된 회차부터 이곳에 표시됩니다.
      </div>
    );
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    document.getElementById('clippings')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <div className="space-y-8">
        {groupByMonth(visibleItems).map(([month, monthItems]) => (
          <section key={month}>
            <h3 className="mb-2 text-sm font-bold text-gray-700">{month}</h3>
            <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
              {monthItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-5"
                  data-newsletter-item="clipping"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#248DAC] text-xs font-bold text-white">
                    뉴스
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/newsletter/${item.publishedAt}`}
                      className="text-sm font-semibold text-gray-900 hover:text-[#248DAC] hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {formatDate(item.publishedAt)}
                    </div>
                  </div>
                  <Link
                    href={`/newsletter/${item.publishedAt}`}
                    className="flex-shrink-0 rounded-lg border border-[#248DAC] px-3 py-2 text-xs font-semibold text-[#248DAC] transition-colors"
                  >
                    보기
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-7 flex items-center justify-center gap-2" aria-label="뉴스클리핑 페이지">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => changePage(safePage - 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          <span className="px-3 py-2 text-xs text-gray-500" aria-live="polite">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => changePage(safePage + 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </nav>
      )}
    </>
  );
}

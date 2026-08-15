import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  SOILAB_COUNSELING_NOTICE,
  SUPPORT_RESOURCES,
} from '@/config/supportResources';
import { NEWSLETTER_PUBLIC_RELEASE } from '@/config/newsletterRelease';
import { pageMetadata } from '@/lib/metadata';
import { getNewsletterList } from '@/lib/notion';
import { formatDate } from '@/lib/utils';
import NewsletterArchive from './NewsletterArchive';
import NewsletterSubscribeForm from './NewsletterSubscribeForm';
import YouthOpportunitySection from './YouthOpportunitySection';

export const metadata: Metadata = pageMetadata({
  path: '/newsletter',
  title: '다시봄 뉴스클리핑',
  description: '고립·은둔 청년과 회복 지원 현장의 등록 언론사 보도를 원문 링크로 안내합니다.',
  siteName: '다시봄 뉴스클리핑',
  image: '/newsletter/opengraph-image',
  imageAlt: '다시봄 뉴스클리핑 | 고립·은둔 청년 회복 지원 뉴스',
});

export const revalidate = 600;

type NewsletterItem = Awaited<ReturnType<typeof getNewsletterList>>[number];

function isNewsClipping(item: NewsletterItem) {
  return item.title.includes('뉴스클리핑')
    || item.summary.includes('주요 카테고리:')
    || item.summary.includes('주요 뉴스');
}

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

function groupByMonth(items: NewsletterItem[]) {
  const groups = new Map<string, NewsletterItem[]>();
  for (const item of items) {
    const key = monthLabel(item.publishedAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}

function newsletterItemHref(item: NewsletterItem, itemKind: 'clipping' | 'letter') {
  return itemKind === 'clipping'
    ? `/newsletter/${item.publishedAt}`
    : `/newsletter/${item.id}`;
}

function NewsletterList({
  items,
  emptyText,
  badge,
  badgeColor,
  showSummary,
  itemKind,
}: {
  items: NewsletterItem[];
  emptyText: string;
  badge: string;
  badgeColor: string;
  showSummary: boolean;
  itemKind: 'clipping' | 'letter';
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupByMonth(items).map(([month, monthItems]) => (
        <section key={month}>
          <h3 className="mb-2 text-sm font-bold text-gray-700">{month}</h3>
          <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
            {monthItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-5"
                data-newsletter-item={itemKind}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: badgeColor }}
                >
                  {badge}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={newsletterItemHref(item, itemKind)}
                    className="text-sm font-semibold text-gray-900 hover:text-[#248DAC] hover:underline"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {formatDate(item.publishedAt)}
                  </div>
                  {showSummary && item.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.summary}</p>
                  )}
                </div>

                <Link
                  href={newsletterItemHref(item, itemKind)}
                  className="flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors"
                  style={{ borderColor: badgeColor, color: badgeColor }}
                >
                  보기
                </Link>
              </div>
            ))}
          </div>
        </section>
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
      <main data-newsletter-release={NEWSLETTER_PUBLIC_RELEASE}>
        <div className="bg-[#248DAC] py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-bold tracking-[0.14em] text-white/75">DASIBOM</p>
            <h1 className="mt-2 text-3xl font-bold text-white">다시봄 뉴스클리핑</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              고립·은둔 청년과 회복 지원 현장의 보도를 등록 언론사 원문으로 안내합니다.
              새로 확인된 기사가 없는 날에는 발송하지 않습니다.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-2 text-xs font-bold text-[#248DAC]">관련 뉴스가 있을 때 발송</div>
              <h2 className="text-lg font-bold text-gray-900">매일 다시봄</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                핵심 키워드와 등록 언론사 기준을 통과한 기사만 하루 최대 7건까지 전합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-2 text-xs font-bold text-[#46549C]">비정기 발송</div>
              <h2 className="text-lg font-bold text-gray-900">센터 기관 소식</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                소이랩 고립·은둔 청년 지원센터의 활동, 안내, 행사 소식을 전합니다.
              </p>
            </div>
          </div>

          <section
            className="mb-10 rounded-2xl border border-amber-100 bg-amber-50 p-5"
            aria-labelledby="counseling-title"
          >
            <h2 id="counseling-title" className="font-bold text-amber-950">
              힘든 시간을 보내고 계신다면 혼자 견디지 않으셔도 됩니다.
            </h2>
            <ul className="mt-3 space-y-1 text-sm leading-6 text-amber-900">
              <li>
                <a
                  href={SUPPORT_RESOURCES.suicidePrevention.href}
                  className="font-semibold underline"
                >
                  {SUPPORT_RESOURCES.suicidePrevention.label}{' '}
                  {SUPPORT_RESOURCES.suicidePrevention.phone}
                </a>{' '}
                ({SUPPORT_RESOURCES.suicidePrevention.detail})
              </li>
              <li>
                <a
                  href={SUPPORT_RESOURCES.mentalHealthCrisis.href}
                  className="font-semibold underline"
                >
                  {SUPPORT_RESOURCES.mentalHealthCrisis.label}{' '}
                  {SUPPORT_RESOURCES.mentalHealthCrisis.phone}
                </a>{' '}
                ({SUPPORT_RESOURCES.mentalHealthCrisis.detail})
              </li>
              <li>
                <a
                  href={SUPPORT_RESOURCES.healthAndWelfare.href}
                  className="font-semibold underline"
                >
                  {SUPPORT_RESOURCES.healthAndWelfare.label}{' '}
                  {SUPPORT_RESOURCES.healthAndWelfare.phone}
                </a>{' '}
                ({SUPPORT_RESOURCES.healthAndWelfare.detail})
              </li>
            </ul>
            <a
              href={SUPPORT_RESOURCES.institutionSearch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-amber-950 underline"
            >
              {SUPPORT_RESOURCES.institutionSearch.label} →
            </a>
            <p className="mt-3 border-t border-amber-200 pt-3 text-xs leading-5 text-amber-800">
              {SOILAB_COUNSELING_NOTICE}
            </p>
          </section>

          <section id="clippings" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs font-bold text-[#248DAC]">NEWS CLIPPING</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">뉴스클리핑 아카이브</h2>
              </div>
              <p className="text-xs text-gray-400">제목·언론사·발행일·원문 링크만 제공</p>
            </div>
            <div className="mt-4">
              <NewsletterArchive items={newsClippings} />
            </div>
            <p className="mt-5 text-xs leading-5 text-gray-500">
              본 클리핑은 각 언론사가 공개한 기사의 제목과 원문 링크만을 안내합니다.
              기사의 저작권은 각 언론사에 있으며, 본문은 원문 링크에서 확인해 주세요.
            </p>
          </section>

          {centerLetters.length > 0 && (
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs font-bold text-[#46549C]">CENTER LETTER</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">기관 소식</h2>
                </div>
                <p className="text-xs text-gray-400">소이랩이 직접 보내는 소식</p>
              </div>
              <div className="mt-4">
                <NewsletterList
                  items={centerLetters}
                  emptyText=""
                  badge="레터"
                  badgeColor="#46549C"
                  showSummary
                  itemKind="letter"
                />
              </div>
            </section>
          )}

          <YouthOpportunitySection />

          <div className="mt-12 rounded-2xl bg-[#F8F9FC] p-6">
            <h2 className="font-semibold text-gray-900">뉴스클리핑을 이메일로 받아보세요</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              신청 후 확인 메일의 버튼을 눌러야 구독이 시작됩니다.
            </p>
            <NewsletterSubscribeForm />
          </div>
        </div>
      </main>
      <Footer newsletterContact />
    </>
  );
}

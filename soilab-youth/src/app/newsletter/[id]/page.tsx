import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  SOILAB_COUNSELING_NOTICE,
  SUPPORT_RESOURCES,
} from '@/config/supportResources';
import { pageMetadata } from '@/lib/metadata';
import { getNewsletterDetail } from '@/lib/notion';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const newsletter = await getNewsletterDetail(id);
  if (!newsletter) {
    return {
      title: '뉴스클리핑을 찾을 수 없습니다',
      robots: { index: false, follow: false },
    };
  }

  const clipping = newsletter.title.includes('뉴스클리핑');
  const canonicalSlug = clipping && newsletter.publishedAt
    ? newsletter.publishedAt
    : id;
  const canonicalPath = `/newsletter/${canonicalSlug}`;
  const description = clipping
    ? `${formatDate(newsletter.publishedAt)} 고립·은둔 청년과 회복 지원 현장 기사 ${newsletter.articles.length}건을 언론사 원문 링크로 안내합니다.`
    : newsletter.summary || `${formatDate(newsletter.publishedAt)} 소이랩 기관 소식`;

  return pageMetadata({
    path: canonicalPath,
    title: newsletter.title,
    description,
    type: clipping ? 'article' : 'website',
    siteName: '다시봄 뉴스클리핑',
    image: '/newsletter/opengraph-image',
    imageAlt: '다시봄 뉴스클리핑 | 고립·은둔 청년 회복 지원 뉴스',
    publishedTime: clipping && newsletter.publishedAt
      ? `${newsletter.publishedAt}T00:00:00+09:00`
      : undefined,
  });
}

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const newsletter = await getNewsletterDetail(id);
  if (!newsletter) notFound();

  const clipping = newsletter.title.includes('뉴스클리핑');

  return (
    <>
      <Header />
      <main>
        <div className="bg-[#248DAC] py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-xs font-bold tracking-[0.14em] text-white/75">
              {clipping ? 'NEWS CLIPPING' : 'CENTER LETTER'}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-10 text-white sm:text-3xl">
              {newsletter.title}
            </h1>
            <p className="mt-3 text-sm text-white/75">{formatDate(newsletter.publishedAt)}</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {clipping ? (
            <>
              {newsletter.articles.length > 0 ? (
                <ol className="space-y-4">
                  {newsletter.articles.map((article, index) => (
                    <li
                      key={`${article.url}-${index}`}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                      data-newsletter-article
                    >
                      <p className="text-xs font-bold text-[#248DAC]">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block font-semibold leading-7 text-gray-900 hover:text-[#248DAC] hover:underline"
                      >
                        {article.title}
                      </a>
                      <p className="mt-2 text-xs text-gray-500">
                        {[article.source, article.publishedAt ? formatDate(article.publishedAt) : '']
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-6 text-sm leading-7 text-gray-600">
                  이 회차는 새 공개 기준 적용 전에 발송되어 기사 목록을 공개하지 않습니다.
                </div>
              )}

              <section className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <h2 className="font-bold">
                  힘든 시간을 보내고 계신다면 혼자 견디지 않으셔도 됩니다.
                </h2>
                <ul className="mt-2 space-y-1">
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
                  className="mt-3 inline-flex font-semibold underline"
                >
                  {SUPPORT_RESOURCES.institutionSearch.label} →
                </a>
                <p className="mt-3 border-t border-amber-200 pt-3 text-xs text-amber-800">
                  {SOILAB_COUNSELING_NOTICE}
                </p>
              </section>

              <p className="mt-6 text-xs leading-5 text-gray-500">
                본 클리핑은 각 언론사가 공개한 기사의 제목과 원문 링크만을 안내합니다.
                기사의 저작권은 각 언론사에 있으며, 본문은 원문 링크에서 확인해 주세요.
              </p>
            </>
          ) : (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {newsletter.summary || '등록된 소개 내용이 없습니다.'}
              </p>
              {newsletter.pdfUrl && (
                <a
                  href={newsletter.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-lg bg-[#46549C] px-5 py-3 text-sm font-semibold text-white"
                >
                  PDF 보기
                </a>
              )}
            </section>
          )}

          <Link
            href="/newsletter"
            className="mt-8 inline-flex text-sm font-semibold text-[#248DAC] hover:underline"
          >
            ← 뉴스레터 목록
          </Link>
        </div>
      </main>
      <Footer newsletterContact />
    </>
  );
}

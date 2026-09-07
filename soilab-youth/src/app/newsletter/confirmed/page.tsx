import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/newsletter/confirmed',
    title: '뉴스클리핑 이메일 구독 결과',
    description: '다시봄 뉴스클리핑 이메일 구독 처리 결과를 안내합니다.',
    siteName: '다시봄 뉴스클리핑',
    image: '/newsletter/opengraph-image',
  }),
  robots: { index: false, follow: false },
};

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const status = (await searchParams).status;
  const done = status === 'done';
  const failed = status === 'failed';

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F9FC]">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-bold tracking-[0.14em] text-[#248DAC]">
              EMAIL SUBSCRIPTION
            </p>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              {done
                ? '구독이 시작됐습니다'
                : failed
                  ? '구독 처리를 완료하지 못했습니다'
                  : '확인 링크가 만료됐습니다'}
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              {done
                ? '새로 확인된 관련 기사가 있는 날에만 다시봄 뉴스클리핑을 보내드리겠습니다.'
                : '뉴스레터 페이지에서 이메일 구독을 다시 신청해 주세요.'}
            </p>
            <Link
              href="/newsletter"
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#46549C] px-6 text-sm font-semibold text-white"
            >
              뉴스레터로 돌아가기
            </Link>
          </section>
        </div>
      </main>
      <Footer newsletterContact />
    </>
  );
}

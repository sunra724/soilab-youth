import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/newsletter/confirm',
    title: '뉴스클리핑 이메일 구독 확인',
    description: '다시봄 뉴스클리핑 이메일 구독 신청을 확인합니다.',
    siteName: '다시봄 뉴스클리핑',
    image: '/newsletter/opengraph-image',
  }),
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const value = (await searchParams).token;
  const token = typeof value === 'string' ? value : '';
  const valid = token.length >= 40 && token.length <= 600;

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F9FC]">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm">
            <p className="text-xs font-bold tracking-[0.14em] text-[#248DAC]">
              EMAIL SUBSCRIPTION
            </p>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              이메일 주소를 확인해 주세요
            </h1>
            {valid ? (
              <>
                <p className="mt-4 text-sm leading-7 text-gray-600">
                  아래 버튼을 누르면 구독이 시작됩니다. 관련 뉴스가 없는 날에는
                  메일을 보내지 않으며, 메일 하단에서 언제든 해지할 수 있습니다.
                </p>
                <form action="/api/subscribe-newsletter/confirm" method="post" className="mt-6">
                  <input type="hidden" name="token" value={token} />
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg bg-[#46549C] px-6 text-sm font-semibold text-white"
                  >
                    이메일 구독 확인
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-4 text-sm leading-7 text-gray-600">
                링크가 잘렸거나 올바르지 않습니다. 뉴스레터 페이지에서 다시 신청해 주세요.
              </p>
            )}
          </section>
        </div>
      </main>
      <Footer newsletterContact />
    </>
  );
}

import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UnsubscribeForm from './UnsubscribeForm';

export const metadata: Metadata = {
  title: '뉴스레터 수신거부',
  description: '소이랩 다시봄레터 수신거부를 처리합니다.',
};

interface Props {
  searchParams: Promise<{
    email?: string;
    token?: string;
  }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params.email ?? '';
  const token = params.token ?? '';

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="py-14" style={{ background: '#248DAC' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-white mb-2">뉴스레터 수신거부</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              다시봄레터 수신 여부를 변경합니다.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-2xl p-6" style={{ background: '#F8F9FC' }}>
            <h2 className="font-semibold text-gray-900">수신거부 확인</h2>
            <UnsubscribeForm email={email} token={token} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

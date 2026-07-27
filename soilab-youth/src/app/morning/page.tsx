import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MorningEnrollForm from '@/components/morning/MorningEnrollForm';
import MorningChallengeApp from '@/components/morning/MorningChallengeApp';
import { getMorningParticipant } from '@/lib/morning/auth';
import { getMorningDashboard } from '@/lib/morning/data';
import { getMorningConfiguration } from '@/lib/morning/db';

export const metadata: Metadata = {
  title: '모닝챌린지 참여',
  description: '초대코드로 참여해 오늘의 작은 약속, 따뜻한 응원, 다음 회복 퀘스트를 기록하세요.',
  alternates: { canonical: 'https://soilab-youth.kr/morning' },
};

export const dynamic = 'force-dynamic';

export default async function MorningPage() {
  const config = getMorningConfiguration();
  const participant = config.configured ? await getMorningParticipant() : null;
  const dashboard = participant ? await getMorningDashboard(participant) : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F4F0E5]">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <Link
                href="/csr/morning-challenge"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#2F6B57] hover:underline"
              >
                <span aria-hidden="true">←</span> 모닝챌린지 소개
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">모닝챌린지</h1>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                작은 아침을 기록하고 나의 속도로 다음 걸음을 이어갑니다.
              </p>
            </div>
            {config.configured && (
              <span className="rounded-full border border-[#B8D8C4] bg-[#EAF4EE] px-3 py-1.5 text-xs font-bold text-[#2F6B57]">
                참여 기록 안전 저장
              </span>
            )}
          </div>

          {!config.configured ? (
            <div className="rounded-3xl border border-[#D9C77D] bg-[#FFF8DF] p-7 sm:p-9">
              <p className="text-sm font-bold text-[#6B5816]">운영 설정 필요</p>
              <h2 className="mt-3 text-2xl font-bold text-gray-950">데이터베이스 연결 후 참여를 시작할 수 있습니다</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
                이 페이지는 가짜 브라우저 기록을 만들지 않습니다. 현재 운영 데이터베이스와 보안 세션
                연결을 점검 중이며, 설정이 완료되면 소이랩이 발급한 초대코드로 참여할 수 있습니다.
              </p>
            </div>
          ) : dashboard ? (
            <MorningChallengeApp initialData={dashboard} />
          ) : (
            <MorningEnrollForm />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

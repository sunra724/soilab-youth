import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  path: '/newsletter/privacy',
  title: '뉴스클리핑 구독 개인정보 처리 안내',
  description: '다시봄 뉴스클리핑 이메일 구독에 필요한 개인정보 처리 내용을 안내합니다.',
  siteName: '다시봄 뉴스클리핑',
  image: '/newsletter/opengraph-image',
  imageAlt: '다시봄 뉴스클리핑 개인정보 처리 안내',
});

function DefinitionRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-gray-900">{title}</dt>
      <dd>{children}</dd>
    </>
  );
}

export default function NewsletterPrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <div className="bg-[#248DAC] py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-xs font-bold tracking-[0.14em] text-white/75">PRIVACY</p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              이메일 구독 개인정보 처리 안내
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-sm leading-7 text-gray-600 sm:px-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">수집·이용</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
              <DefinitionRow title="처리 주체">협동조합 소이랩</DefinitionRow>
              <DefinitionRow title="수집 항목">
                이메일 주소, 동의 및 구독 확인 시각, 발송·반송·수신거부 상태
              </DefinitionRow>
              <DefinitionRow title="이용 목적">
                다시봄 뉴스클리핑과 소이랩 기관 소식 발송
              </DefinitionRow>
              <DefinitionRow title="보유 기간">
                구독 해지 시까지. 확인하지 않은 신청 정보는 별도로 구독자 명단에 저장하지 않습니다.
              </DefinitionRow>
            </dl>
            <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
              동의를 거부할 수 있으며, 거부하면 이메일 구독 기능을 이용할 수 없습니다.
              웹사이트의 공개 뉴스클리핑 열람에는 영향이 없습니다.
            </p>
          </section>

          <section
            id="overseas"
            className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900">
              이메일 발송을 위한 국외 이전
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
              <DefinitionRow title="이전받는 자">Plus Five Five, Inc. (Resend)</DefinitionRow>
              <DefinitionRow title="이전 국가">미국</DefinitionRow>
              <DefinitionRow title="이전 항목">수신 이메일 주소와 발송 메시지 내용</DefinitionRow>
              <DefinitionRow title="시기·방법">
                구독 확인 메일 및 뉴스레터 발송 시 암호화된 네트워크로 전송
              </DefinitionRow>
              <DefinitionRow title="이용 목적">구독 확인과 뉴스레터 전달</DefinitionRow>
              <DefinitionRow title="보유 기준">
                이메일 발송 서비스 계약 및 제공사의 개인정보 처리방침에 따름
              </DefinitionRow>
            </dl>
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex font-semibold text-[#248DAC] underline"
            >
              Resend 개인정보 처리 안내
            </a>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">열람·삭제 및 문의</h2>
            <p className="mt-3">
              수신 메일 하단의 수신거부 링크를 이용하면 즉시 발송 대상에서 제외됩니다.
              그 밖의 열람·정정·삭제 요청은{' '}
              <a href="mailto:soilabcoop@gmail.com" className="font-semibold text-[#248DAC] underline">
                soilabcoop@gmail.com
              </a>
              으로 문의해 주세요.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              시행일: 2026년 7월 29일 ·{' '}
              <Link href="/newsletter" className="font-semibold underline">
                뉴스레터로 돌아가기
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer newsletterContact />
    </>
  );
}

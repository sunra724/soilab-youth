import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return <>
    <Header />
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-sm font-bold text-blue-dark">404</p>
      <h1 className="mt-4 text-3xl font-bold text-navy">페이지를 찾을 수 없습니다</h1>
      <p className="mt-5 leading-7 text-gray-600">주소가 바뀌었거나 일부가 빠졌을 수 있습니다. 연구노트와 자료실에서 찾으시는 내용을 살펴보세요.</p>
      <nav aria-label="다시 찾아보기" className="mt-8 flex flex-wrap gap-4">
        <Link className="rounded-lg bg-navy px-5 py-3 font-bold text-white" href="/research/notes">연구노트 보기</Link>
        <Link className="rounded-lg border border-gray-300 px-5 py-3 font-bold text-navy" href="/research/evidence">정책·근거 자료실</Link>
        <Link className="rounded-lg border border-gray-300 px-5 py-3 font-bold text-navy" href="/">홈으로</Link>
      </nav>
    </main>
    <Footer />
  </>;
}

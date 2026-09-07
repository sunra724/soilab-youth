import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './research.css';

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><main id="research-main" className="research">
    <div className="research-masthead"><div className="research-wrap"><Link href="/research">SOILAB <span>청년 정책·연구</span></Link><span>YOUTH · CONNECTION · RECOVERY</span></div></div>
    <nav className="research-nav research-wrap" aria-label="정책·연구 메뉴">
      <Link href="/research">연구 데스크</Link><Link href="/research/evidence">정책·근거</Link><Link href="/research/notes">연구노트</Link><Link href="/research/support">지원 안내</Link><Link href="/research/statistics">통계</Link><Link href="/research/topics">주제별 검토</Link><Link href="/research/briefings">브리핑 기록</Link>
    </nav>
    {children}
    <div className="research-end research-wrap"><p>현장의 질문을 기록하고, 근거를 읽고, 청년의 삶에 연결합니다.</p><Link href="/livinglab">소이랩 리빙랩 살펴보기 ↗</Link></div>
  </main><Footer /></>;
}

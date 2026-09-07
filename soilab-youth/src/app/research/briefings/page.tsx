import type { Metadata } from 'next';
import Link from 'next/link';
import { getBriefings } from '@/lib/research/db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '청년 정책 브리핑 기록', description: '아침에 발행하는 청년 정책 브리핑과 당시 확인한 출처를 날짜별로 보관합니다.', alternates: { canonical: '/research/briefings' } };
export default async function BriefingsPage() {
  const archive = await getBriefings();
  return <section className="research-wrap research-section"><div className="research-page-heading"><p className="research-eyebrow">DAILY POLICY RECORD</p><h1>아침의 기록, 다음 실천의 근거.</h1><p>정책 신호와 확인할 쟁점, 실행 제안을 날짜별로 읽습니다.</p></div>
    <p className="research-note">브리핑은 수집한 자료를 바탕으로 AI가 편집합니다. 확정된 정책과 보도 동향, 소이랩에 대한 제안을 구분해서 읽고 세부 요건은 원문에서 확인해 주세요.</p>
    {archive.items.length ? <div className="research-briefing-list">{archive.items.map(item => <Link href={`/research/briefings/${item.briefing_date}`} key={item.briefing_date}><time>{item.briefing_date}</time><div><h2>{item.title}</h2><p>{item.summary}</p></div><span>↗</span></Link>)}</div> : <div className="research-empty"><h2>{archive.available ? '아직 발행된 브리핑이 없습니다.' : '브리핑 보관함을 연결하고 있습니다.'}</h2><p>그동안 검토할 정책과 연구 원문을 먼저 살펴보세요.</p><Link href="/research/evidence" className="research-button">정책·근거 보기 →</Link></div>}
  </section>;
}

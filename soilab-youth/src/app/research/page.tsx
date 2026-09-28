import type { Metadata } from 'next';
import Link from 'next/link';
import EvidenceCard from '@/components/research/EvidenceCard';
import { RESEARCH_REVIEW_DATE, researchTopics } from '@/data/research';
import { researchNotes } from '@/data/research-notes';
import { getSourceCatalog } from '@/lib/research/catalog';
import { getBriefings } from '@/lib/research/db';
import { telegramChannelUrl } from '@/lib/research/core';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '청년 정책·연구 데스크', description: '고립·은둔 청년의 발굴, 일상회복, 가족지원과 사회참여를 정책·연구의 근거로 연결합니다.', alternates: { canonical: '/research' } };

export default async function ResearchPage() {
  const [archive, catalog] = await Promise.all([getBriefings(), getSourceCatalog()]);
  const evidenceLibrary = catalog.items;
  const latestReviewDate = evidenceLibrary.reduce((latest, item) => item.reviewedAt && item.reviewedAt > latest ? item.reviewedAt : latest, RESEARCH_REVIEW_DATE);
  const channel = telegramChannelUrl();
  return <>
    <section className="research-hero"><div className="research-wrap research-hero-grid">
      <div><p className="research-eyebrow">SOILAB RESEARCH DESK</p><h1>연결의 질문을,<br />회복의 근거로.</h1><p className="research-lead">청년을 만나는 현장의 질문에서 시작합니다.<br />국내외 정책과 연구를 읽고, 소이랩의 다음 실천으로 이어갑니다.</p><div className="research-hero-links"><Link className="research-button" href="/research/evidence">정책·근거 찾아보기 ↗</Link><Link href="/research/topics">함께 검토할 질문 →</Link></div></div>
      <aside className="research-index"><p className="research-eyebrow">지금 열어둔 연구 노트</p><strong>청년의 속도를<br />존중하는 지원</strong><dl><div><dt>색인 자료</dt><dd>{String(evidenceLibrary.length).padStart(2, '0')}</dd></div><div><dt>검토 주제</dt><dd>{String(researchTopics.length).padStart(2, '0')}</dd></div><div><dt>최근 자료 확인일</dt><dd className="research-index-date">{latestReviewDate}</dd></div></dl></aside>
    </div></section>
    <section className="research-wrap research-section"><div className="research-grid"><Link href="/research/support" className="research-resource-card"><p className="research-eyebrow">청년·가족을 위한 안내</p><h2>도움이 필요할 때,<br />어디부터 문의할까요?</h2><p>대구 지원사업 문의처와 신청 전에 확인할 내용을 안내합니다.</p><span>지원 문의 안내 →</span></Link><Link href="/research/statistics" className="research-resource-card"><p className="research-eyebrow">2025 KOSIS 통계</p><h2>관계와 고립을<br />어떤 수치로 읽을까요?</h2><p>전국 연령대별 관계망·외로움과 대구의 전체 연령 자료를 살펴봅니다.</p><span>통계와 해석 범위 →</span></Link></div></section>
    <section className="research-wrap research-section"><div className="research-section-heading"><div><p className="research-eyebrow">RESEARCH NOTES</p><h2>원문에서 현장으로, 연구노트</h2><p>확인한 근거와 센터에서 검토할 제안을 구분해 읽습니다.</p></div><Link href="/research/notes">전체 연구노트 →</Link></div><div className="research-briefing-list">{researchNotes.slice(0, 3).map(note => <Link href={`/research/notes/${note.id}`} key={note.id}><time dateTime={note.publishedAt}>{note.publishedAt}</time><div><h3>{note.title}</h3><p>{note.summary}</p></div><span aria-hidden="true">↗</span></Link>)}</div></section>
    <section className="research-wrap research-section"><div className="research-section-heading"><div><p className="research-eyebrow">QUESTION → EVIDENCE → PRACTICE</p><h2>지금 함께 검토할 질문</h2></div><Link href="/research/topics">전체 주제 →</Link></div>
      <div className="research-question-grid">{researchTopics.slice(0, 3).map((topic, index) => <Link key={topic.id} href={`/research/topics/${topic.id}`} className="research-question"><span className="research-number">0{index + 1}</span><p className="research-eyebrow">{topic.name}</p><h3>{topic.question}</h3><p>{topic.description}</p><span className="research-arrow">검토 시작하기 ↗</span></Link>)}</div>
    </section>
    <section className="research-band"><div className="research-wrap research-band-inner"><div><p className="research-eyebrow">MORNING POLICY BRIEFING</p><h2>아침에 읽는 청년 정책의 변화</h2><p>정책 신호와 출처, 확인이 필요한 쟁점,<br />소이랩이 검토할 다음 행동을 짧게 전합니다.</p></div><div className="research-band-action">{channel ? <a href={channel} target="_blank" rel="noopener noreferrer" className="research-button research-button-light">텔레그램에서 받아보기 ↗</a> : <span className="research-pill">텔레그램 채널 연결 준비 중</span>}<Link href="/research/briefings">날짜별 브리핑 기록 →</Link></div></div></section>
    <section className="research-wrap research-section"><div className="research-section-heading"><div><p className="research-eyebrow">EVIDENCE LIBRARY</p><h2>현장을 지지하는 정책과 연구</h2><p>자료의 내용과 확인 범위, 적용할 때의 한계를 함께 읽습니다.</p></div><Link href="/research/evidence">전체 자료 →</Link></div><div className="research-grid">{evidenceLibrary.slice(0, 4).map(item => <EvidenceCard key={item.id} item={item} />)}</div></section>
    <section className="research-wrap research-section research-top-rule"><div className="research-section-heading"><div><p className="research-eyebrow">DAILY RECORD</p><h2>날짜별로 쌓이는 정책 브리핑</h2></div><Link href="/research/briefings">기록 보기 →</Link></div>
      {archive.items.length ? <div className="research-briefing-list">{archive.items.slice(0, 3).map(item => <Link href={`/research/briefings/${item.briefing_date}`} key={item.briefing_date}><time>{item.briefing_date}</time><div><h3>{item.title}</h3><p>{item.summary}</p></div><span>↗</span></Link>)}</div> : <div className="research-empty"><h3>{archive.available ? '첫 정책 브리핑을 준비하고 있습니다.' : '브리핑 보관함을 연결하고 있습니다.'}</h3><p>발행한 브리핑은 당시의 출처와 함께 이곳에 쌓입니다.</p></div>}
    </section>
  </>;
}

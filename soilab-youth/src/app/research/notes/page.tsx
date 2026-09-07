import type { Metadata } from 'next';
import Link from 'next/link';
import { researchNotes } from '@/data/research-notes';

export const metadata: Metadata = {
  title: '연구노트',
  description: '정책과 연구의 근거를 읽고 고립·은둔청년 지원 현장의 질문과 연결합니다.',
  alternates: { canonical: '/research/notes' },
};

export default function ResearchNotesPage() {
  return <section className="research-wrap research-section">
    <div className="research-page-heading"><p className="research-eyebrow">RESEARCH NOTES</p><h1>근거를 읽고,<br />다음 실천을 묻습니다.</h1><p>원문에서 확인한 내용과 센터에서 검토할 제안, 해석의 한계를 함께 기록합니다.</p></div>
    <div className="research-briefing-list">{researchNotes.map(note => <Link href={`/research/notes/${note.id}`} key={note.id}><time dateTime={note.publishedAt}>{note.publishedAt}</time><div><h2>{note.title}</h2><p>{note.summary}</p></div><span aria-hidden="true">↗</span></Link>)}</div>
  </section>;
}

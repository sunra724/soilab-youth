import Link from 'next/link';
import { researchNotes } from '@/data/research-notes';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  path: '/research/notes/incheon-research',
  title: '인천연구원 자료를 읽은 연구노트',
  description: '인천연구원 자료를 바탕으로 외로움, 청년지원, 일경험과 동네의 연결을 살펴본 연구노트를 모았습니다.',
});

export default function IncheonResearchNotesPage() {
  const notes = researchNotes.filter(note => note.id.startsWith('incheon-research-'));
  return <section className="research-wrap research-section">
    <Link className="research-back" href="/research/notes">← 전체 연구노트</Link>
    <div className="research-page-heading"><p className="research-eyebrow">RESEARCH NOTES</p><h1>인천연구원 자료를 읽은 연구노트</h1><p>외로움과 청년지원, 일경험과 동네의 연결을 살펴봅니다. 읽으려던 글을 아래에서 선택해 주세요.</p></div>
    <div className="research-briefing-list">{notes.map(note => <Link href={`/research/notes/${note.id}`} key={note.id}><time dateTime={note.publishedAt}>{note.publishedAt}</time><div><h2>{note.title}</h2><p>{note.summary}</p></div><span aria-hidden="true">↗</span></Link>)}</div>
  </section>;
}

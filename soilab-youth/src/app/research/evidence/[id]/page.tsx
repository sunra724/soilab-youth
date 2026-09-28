import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RESEARCH_REVIEW_DATE, researchTopics } from '@/data/research';
import { researchNotes } from '@/data/research-notes';
import { getSourceCatalog } from '@/lib/research/catalog';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = (await getSourceCatalog()).items.find(row => row.id === id);
  return { title: item?.title ?? '자료를 찾을 수 없습니다', alternates: { canonical: `/research/evidence/${id}` } };
}
export default async function EvidenceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = (await getSourceCatalog()).items.find(row => row.id === id);
  if (!item) notFound();
  const notes = researchNotes.filter(note => note.sources.some(source => source.evidenceId === id));
  return <article className="research-wrap research-section research-detail"><Link className="research-back" href="/research/evidence">← 정책·근거 목록</Link><div className="research-page-heading"><p className="research-eyebrow">{item.kind} · {item.country} · {item.year}</p><h1>{item.title}</h1><p>{item.publisher}</p></div>
    <a className="research-button" href={item.url} target="_blank" rel="noopener noreferrer">발행기관 원문 보기 ↗</a>
    <div className="research-note"><span className="research-eyebrow">자료 확인 범위 · {item.reviewedAt || RESEARCH_REVIEW_DATE}</span><p>{item.reviewScope}</p>{item.scope && <p>대상 구분: {item.scope === 'youth' ? '아동·청소년·청년 (자료별 연령 확인 필요)' : '전 연령·제도 배경'}</p>}{item.publishedAt && <p>{item.kind === '법령' ? '공포일' : '게시일'}: {item.publishedAt}</p>}{item.effectiveAt && <p>시행일: {item.effectiveAt}</p>}</div>
    <section><h2>자료에서 살펴볼 내용</h2><p>{item.summary}</p></section><section><h2>소이랩의 검토 방향</h2><p>{item.application}</p></section><section className="research-note"><h2>해석할 때 확인할 점</h2><p>{item.limitation}</p></section>
    {notes.length > 0 && <section><h2>이 자료를 읽고 쓴 연구노트</h2><div className="research-tags">{notes.map(note => <Link href={`/research/notes/${note.id}`} key={note.id}>{note.title} →</Link>)}</div></section>}
    <section><h2>연결된 질문</h2><div className="research-tags">{researchTopics.filter(topic => item.topics.includes(topic.id)).map(topic => <Link href={`/research/topics/${topic.id}`} key={topic.id}>{topic.name} ↗</Link>)}</div></section>
  </article>;
}

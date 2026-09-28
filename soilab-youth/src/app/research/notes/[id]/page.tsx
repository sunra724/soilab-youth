import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { researchTopics } from '@/data/research';
import { researchNotes } from '@/data/research-notes';
import { pageMetadata } from '@/lib/metadata';

export function generateStaticParams() {
  return researchNotes.map(note => ({ id: note.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const note = researchNotes.find(item => item.id === id);
  if (!note) return { title: '연구노트를 찾을 수 없습니다' };
  return pageMetadata({ path: `/research/notes/${id}`, title: note.title, description: note.summary, type: 'article', publishedTime: `${note.publishedAt}T00:00:00+09:00` });
}

export default async function ResearchNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = researchNotes.find(item => item.id === id);
  if (!note) notFound();
  return <article className="research-wrap research-section research-detail research-article">
    <Link className="research-back" href="/research/notes">← 연구노트 목록</Link>
    <header className="research-page-heading"><p className="research-eyebrow">RESEARCH NOTE · <time dateTime={note.publishedAt}>{note.publishedAt}</time></p><h1>{note.title}</h1><p>{note.summary}</p></header>
    <p className="research-article-intro">{note.introduction}</p>
    {note.highlights && <section className="research-note"><h2>세 줄로 읽는 핵심</h2><ul className="research-guide-list">{note.highlights.map(point => <li key={point}>{point}</li>)}</ul></section>}
    {note.sections.map(section => <section key={section.title}>
      <h2>{section.title}</h2><p>{section.evidence}</p>
      <p className="research-inline-citations">확인한 근거 {section.references.map(number => <a href={`#source-${number}`} key={number}>[{number}] {note.sources[number - 1].year}</a>)}</p>
      <aside className="research-note"><p className="research-eyebrow">센터 검토 제안</p><p>{section.proposal}</p></aside>
    </section>)}
    <section><h2>{note.recordTitle ?? '첫 연결을 살펴볼 기록 항목'}</h2><p>아래 항목은 운영회의에서 논의할 제안입니다. 개인 사례는 공개하지 않고, 연락과 정보 공유는 동의한 범위에서 검토합니다.</p>
      <div className="research-table-scroll" tabIndex={0} role="region" aria-label="기록 항목과 검토 질문 표"><table className="research-table"><caption>기록 항목과 검토 질문</caption><thead><tr><th scope="col">항목</th><th scope="col">살펴볼 기록</th><th scope="col">검토 질문</th></tr></thead><tbody>{note.steps.map(step => <tr key={step.stage}><th scope="row">{step.stage}</th><td>{step.record}</td><td>{step.question}</td></tr>)}</tbody></table></div>
    </section>
    {note.context && <section><h2>보도자료의 수치를 읽을 때</h2><p>{note.context}</p></section>}
    <section className="research-note"><h2>이 글의 검토 범위와 한계</h2><p>{note.limitation}</p></section>
    <section><h2>읽은 원문과 확인 범위</h2><p>각 출처에 실제 확인한 부분을 적었습니다. PDF는 원문의 인쇄 쪽수와 링크한 파일 순서를 구분해 표시합니다.</p>
      <ol className="research-citations">{note.sources.map((source, index) => <li id={`source-${index + 1}`} key={source.evidenceId}>
        <span>{source.authors} · {source.year}</span><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} · {source.linkLabel ?? '원문 PDF'} ↗</a><small>확인 부분: {source.pages}</small><p>{source.scope}</p><Link href={`/research/evidence/${source.evidenceId}`}>자료 요약과 적용 한계 →</Link>
      </li>)}</ol>
    </section>
    {note.relatedLinks && <section><h2>지원 안내와 함께 읽을 글</h2><ul className="research-guide-list">{note.relatedLinks.map(link => <li key={link.href}><Link href={link.href}>{link.title} →</Link></li>)}</ul></section>}
    <section><h2>함께 검토할 질문</h2><div className="research-tags">{researchTopics.filter(topic => note.topics.includes(topic.id)).map(topic => <Link href={`/research/topics/${topic.id}`} key={topic.id}>{topic.name} ↗</Link>)}</div></section>
  </article>;
}

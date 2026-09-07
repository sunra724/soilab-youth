import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EvidenceCard from '@/components/research/EvidenceCard';
import { researchTopics } from '@/data/research';
import { getSourceCatalog } from '@/lib/research/catalog';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: researchTopics.find(item => item.id === id)?.name ?? '주제별 검토', alternates: { canonical: `/research/topics/${id}` } };
}
export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = researchTopics.find(item => item.id === id);
  if (!topic) notFound();
  const sources = (await getSourceCatalog()).items.filter(item => item.topics.includes(id));
  return <section className="research-wrap research-section"><Link className="research-back" href="/research/topics">← 주제별 검토</Link><div className="research-page-heading"><p className="research-eyebrow">{topic.name} · 검토 질문</p><h1>{topic.question}</h1><p>{topic.description}</p></div><aside className="research-next-action"><p className="research-eyebrow">소이랩의 다음 검토 행동</p><h2>{topic.action}</h2><p>아래 자료를 읽으며 검토할 제안입니다. 실행 결과와 효과는 현장에서 별도로 확인합니다.</p></aside><div className="research-section-heading"><h2>함께 읽을 근거</h2><span>{sources.length}건</span></div><div className="research-grid">{sources.map(item => <EvidenceCard key={item.id} item={item} />)}</div></section>;
}

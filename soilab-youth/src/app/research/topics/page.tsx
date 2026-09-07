import type { Metadata } from 'next';
import Link from 'next/link';
import { researchTopics } from '@/data/research';
import { getSourceCatalog } from '@/lib/research/catalog';

export const metadata: Metadata = { title: '주제별 검토', description: '발굴, 일상회복, 가족지원, 일경험, 회복성과와 지역정책의 질문을 함께 검토합니다.', alternates: { canonical: '/research/topics' } };
export const dynamic = 'force-dynamic';
export default async function TopicsPage() {
  const evidenceLibrary = (await getSourceCatalog()).items;
  return <section className="research-wrap research-section"><div className="research-page-heading"><p className="research-eyebrow">OPEN RESEARCH QUESTIONS</p><h1>현장의 질문에서 시작합니다.</h1><p>질문마다 관련 근거와 다음 검토 행동을 묶었습니다. 연구 결과가 쌓이면 해석과 제안을 갱신합니다.</p></div><div className="research-question-grid">{researchTopics.map((topic, index) => <Link href={`/research/topics/${topic.id}`} className="research-question" key={topic.id}><span className="research-number">0{index + 1}</span><p className="research-eyebrow">{topic.name}</p><h2>{topic.question}</h2><p>{topic.description}</p><span className="research-arrow">연결 자료 {evidenceLibrary.filter(item => item.topics.includes(topic.id)).length}건 ↗</span></Link>)}</div></section>;
}

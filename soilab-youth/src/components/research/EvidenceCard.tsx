import Link from 'next/link';
import type { Evidence } from '@/data/research';

export default function EvidenceCard({ item }: { item: Evidence }) {
  return <article className="research-source-card">
    <div className="research-meta"><span>{item.kind}</span><span>{item.country} · {item.year}</span></div>
    <h3><Link href={`/research/evidence/${item.id}`}>{item.title}</Link></h3>
    <p>{item.summary}</p>
    <div className="research-source-bottom"><span>{item.publisher}</span><Link href={`/research/evidence/${item.id}`} aria-label={`${item.title} 검토 내용 보기`}>검토 내용 ↗</Link></div>
  </article>;
}

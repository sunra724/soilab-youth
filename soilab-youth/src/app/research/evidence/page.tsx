import type { Metadata } from 'next';
import EvidenceFilter from '@/components/research/EvidenceFilter';
import { getSourceCatalog } from '@/lib/research/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: '정책·근거 자료실', description: '고립·은둔 청년 지원의 법령, 실태조사, 연구와 해외 실무 지침을 찾아보세요.', alternates: { canonical: '/research/evidence' } };
export default async function EvidencePage() {
  const catalog = await getSourceCatalog();
  return <section className="research-wrap research-section"><div className="research-page-heading"><p className="research-eyebrow">EVIDENCE LIBRARY</p><h1>정책·근거</h1><p>어떤 자료인지, 어디까지 확인했는지, 현장에 어떻게 연결할지 함께 기록합니다.</p></div><EvidenceFilter library={catalog.items} /></section>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBriefings } from '@/lib/research/db';
import { publicUrl, validDate } from '@/lib/research/core';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  return { title: `청년 정책 브리핑 · ${date}`, alternates: { canonical: `/research/briefings/${date}` } };
}
export default async function BriefingPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!validDate(date)) notFound();
  const archive = await getBriefings(date);
  if (!archive.available) return <section className="research-wrap research-section research-empty"><h1>브리핑을 불러오지 못했습니다.</h1><p>잠시 후 다시 확인해 주세요.</p><Link href="/research/briefings">브리핑 목록으로 →</Link></section>;
  const item = archive.items[0];
  if (!item) notFound();
  return <article className="research-wrap research-section research-detail"><Link className="research-back" href="/research/briefings">← 브리핑 기록</Link><div className="research-page-heading"><p className="research-eyebrow">{date} · AI 편집 브리핑</p><h1>{item.title}</h1><p>{item.summary}</p></div><div className="research-briefing-body">{item.body_text}</div><section><h2>이번 브리핑의 출처</h2><ol className="research-citations">{item.sources.map((source, index) => <li key={`${source.url}-${index}`}><span>{source.tier === 'official' ? '공식 자료' : source.tier === 'research' ? '연구 자료' : '보도 · 원문 확인 필요'}</span>{publicUrl(source.url) ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a> : <strong>{source.title}</strong>}<small>{source.publisher} · 수집 확인 {source.checked_at.slice(0, 10)}</small></li>)}</ol>{!item.sources.length && <p>이번 발행에는 새로 선별된 자료가 없습니다.</p>}</section></article>;
}

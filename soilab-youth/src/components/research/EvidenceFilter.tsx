'use client';

import { useState } from 'react';
import { filterEvidence, researchTopics, type Evidence } from '@/data/research';
import EvidenceCard from './EvidenceCard';

export default function EvidenceFilter({ library }: { library: Evidence[] }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [topic, setTopic] = useState('');
  const items = filterEvidence(query, kind, topic, library);
  return <>
    <div className="research-filters">
      <label>자료 검색<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="제목, 기관, 국가, 내용으로 찾기" /></label>
      <label>자료 유형<select value={kind} onChange={e => setKind(e.target.value)}><option value="">전체 유형</option>{Array.from(new Set(library.map(item => item.kind))).map(value => <option key={value}>{value}</option>)}</select></label>
      <label>관심 주제<select value={topic} onChange={e => setTopic(e.target.value)}><option value="">전체 주제</option>{researchTopics.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </div>
    <p className="research-result-count" aria-live="polite">{items.length}개의 자료</p>
    <div className="research-grid">{items.map(item => <EvidenceCard key={item.id} item={item} />)}</div>
    {!items.length && <div className="research-empty"><h2>검색 조건에 맞는 자료가 없습니다.</h2><p>다른 검색어를 입력하거나 필터를 초기화해 보세요.</p><button className="research-button" onClick={() => { setQuery(''); setKind(''); setTopic(''); }}>필터 초기화</button></div>}
  </>;
}

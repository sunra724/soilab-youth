'use client';

import { useState } from 'react';
import { researchTopics } from '@/data/research';
import type { ReviewedSource } from '@/lib/research/source-core';

type Run = { provider: string; started_at: string; status: string; record_count: number; details: { failures?: string[]; truncated?: string[]; detailFailures?: number; error?: string } };
const labels = { pending: '검토 대기', approved: '공개 중', excluded: '제외' };

export default function SourceReview() {
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<ReviewedSource['review_status']>('pending');
  const [items, setItems] = useState<ReviewedSource[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<ReviewedSource | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function request(path: string, init?: RequestInit) {
    const response = await fetch(path, { ...init, cache: 'no-store', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '요청을 완료하지 못했습니다.');
    return data;
  }
  async function load(nextStatus = status, nextPage = page) {
    const data = await request(`/api/research/review?status=${nextStatus}&page=${nextPage}`);
    setItems(data.items); setRuns(data.runs); setHasMore(data.hasMore); setStatus(nextStatus); setPage(nextPage); setSelected(null); setConnected(true);
  }
  async function act(action: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : '요청 실패'); }
    finally { setBusy(false); }
  }
  async function save(review_status: ReviewedSource['review_status']) {
    if (!selected) return;
    await request('/api/research/review', { method: 'PATCH', body: JSON.stringify({ ...selected, review_status }) });
    await load(status, 0); setMessage(`검토 결과를 저장했습니다: ${labels[review_status]}`);
  }
  async function sync(provider: 'nkis' | 'law') {
    const result = await request(`/api/research/sync?provider=${provider}`, { method: 'POST' });
    await load('pending', 0);
    setMessage(`${provider.toUpperCase()} ${result.record_count}건 수집 · ${result.status === 'success' ? '완료' : '일부 조회 실패 또는 수집 상한 도달. 수집 기록을 확인하세요.'}`);
  }

  return <div className="research-review">
    {!connected ? <form className="research-review-login research-note" onSubmit={e => { e.preventDefault(); void act(() => load('pending', 0)); }}>
      <label>검토용 접속 키<input type="password" autoComplete="off" value={token} required minLength={32} onChange={e => setToken(e.target.value)} /></label>
      <p>운영자용 접속 키로 검토함을 엽니다. 접속 키는 이 페이지를 닫으면 사라집니다.</p>
      <button className="research-button" disabled={busy}>검토함 열기</button>
    </form> : <>
      <div className="research-review-toolbar">
        <div>{(Object.keys(labels) as ReviewedSource['review_status'][]).map(value => <button key={value} disabled={busy} aria-pressed={status === value} onClick={() => void act(() => load(value, 0))}>{labels[value]}</button>)}</div>
        <div><button disabled={busy} onClick={() => void act(() => sync('nkis'))}>연구자료 수집</button><button disabled={busy} onClick={() => void act(() => sync('law'))}>법령 수집</button><button disabled={busy} onClick={() => { setToken(''); setConnected(false); setSelected(null); setItems([]); setRuns([]); setMessage(''); }}>접속 종료</button></div>
      </div>
      {runs.length > 0 && <details className="research-note"><summary>최근 수집 기록</summary><ul>{runs.map((run, index) => <li key={index}>{new Date(run.started_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} · {run.provider.toUpperCase()} · {run.record_count}건 · {{ success: '완료', partial: '일부 확인 필요', failed: '실패' }[run.status] || run.status}{run.details.error && ` · ${run.details.error}`}{Boolean(run.details.failures?.length) && ` · 조회 실패: ${run.details.failures?.join(', ')}`}{Boolean(run.details.detailFailures) && ` · 상세 조회 실패 ${run.details.detailFailures}건`}{Boolean(run.details.truncated?.length) && ` · 상한: ${run.details.truncated?.join(', ')}`}</li>)}</ul></details>}
      <div className="research-review-grid">
        <div><p>{page + 1}페이지 · {items.length}건</p><div className="research-review-list">{items.map(item => <button key={item.id} disabled={busy} aria-pressed={selected?.id === item.id} onClick={() => setSelected({ ...item })}><span>{item.provider.toUpperCase()} · {item.publication_year || '연도 미확인'} · {item.scope === 'youth' ? '청년·청소년' : '전 연령'}</span><strong>{item.title}</strong><span>{item.publisher}</span></button>)}</div>{!items.length && <p className="research-empty">이 상태의 자료가 없습니다.</p>}<div className="research-review-toolbar"><button disabled={busy || page === 0} onClick={() => void act(() => load(status, page - 1))}>이전</button><button disabled={busy || !hasMore} onClick={() => void act(() => load(status, page + 1))}>다음</button></div></div>
        <div>{selected ? <form className="research-review-editor" onSubmit={e => { e.preventDefault(); void act(() => save('approved')); }}>
          <h2>{selected.title}</h2><p>{selected.publisher} · {selected.authors}</p><a href={selected.url} target="_blank" rel="noopener noreferrer">원문 열기 ↗</a>
          <p>발행연도 {selected.publication_year || '미확인'}{selected.published_at && ` · 공포일 ${selected.published_at}`}{selected.effective_at && ` · 시행일 ${selected.effective_at}`}</p>
          <p>수집일 {selected.imported_at.slice(0, 10)} · 최근 조회 {selected.checked_at.slice(0, 10)}</p>
          <details className="research-note"><summary>수집된 초록·메타데이터 (전문 검토 전)</summary><p className="research-review-excerpt">{selected.raw_excerpt || '초록을 제공하지 않는 자료입니다. 원문을 확인하세요.'}</p></details>
          {([['summary', '자료 요약'], ['application', '소이랩의 적용·검토 방향'], ['limitation', '해석의 한계와 확인할 점'], ['review_scope', '실제로 확인한 범위 (예: 초록, 본문 10~20쪽)']] as const).map(([key, label]) => <label key={key}>{label}<textarea required value={selected[key]} maxLength={key === 'review_scope' ? 500 : 2500} rows={key === 'review_scope' ? 2 : 4} onChange={e => setSelected({ ...selected, [key]: e.target.value })} /></label>)}
          <fieldset><legend>연결할 검토 주제</legend>{researchTopics.map(topic => <label key={topic.id}><input type="checkbox" checked={selected.topics.includes(topic.id)} onChange={e => setSelected({ ...selected, topics: e.target.checked ? [...selected.topics, topic.id] : selected.topics.filter(t => t !== topic.id) })} />{topic.name}</label>)}</fieldset>
          <p>공개하면 자료실에 표시되고 최근 검토자료로 브리핑에서 활용됩니다. 원자료가 바뀌면 검토 대기로 돌아옵니다.</p>
          <div className="research-review-toolbar"><button type="submit" className="research-button" disabled={busy}>검토 완료·공개</button><button type="button" disabled={busy} onClick={() => void act(() => save('pending'))}>대기로 저장</button><button type="button" disabled={busy} onClick={() => void act(() => save('excluded'))}>제외</button></div>
        </form> : <div className="research-empty">목록에서 검토할 자료를 선택하세요.</div>}</div>
      </div>
    </>}
    <p className="research-review-message" role="status" aria-live="polite">{busy ? '처리 중입니다…' : message}</p>
  </div>;
}

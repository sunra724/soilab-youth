import type { Metadata } from 'next';
import Link from 'next/link';
import snapshot from '@/data/research-statistics.json';
import type { StatisticRow } from '@/lib/research/statistics-core';

export const metadata: Metadata = { title: '청년의 관계와 고립을 읽는 통계', description: 'KOSIS 2025년 사회적 관계망·외로움·사회적 고립감 통계. 전국 연령대별 수치와 대구 전체 연령 맥락을 구분합니다.', alternates: { canonical: '/research/statistics' } };

function Values({ rows, caption }: { rows: StatisticRow[]; caption: string }) {
  return <div className="research-table-scroll" tabIndex={0} role="region" aria-label={caption}><table className="research-table research-stat-table"><caption>{caption} · {snapshot.period}년</caption><thead><tr><th scope="col">대상</th><th scope="col">문항</th><th scope="col">값</th></tr></thead><tbody>{rows.map(row => <tr key={`${row.population}/${row.metric}`}><th scope="row">{row.population}</th><td>{row.metric}</td><td className="research-stat-value">{row.value}{row.unit === '%' ? '%' : '점'}</td></tr>)}</tbody></table></div>;
}

export default function StatisticsPage() {
  return <article className="research-wrap research-section research-detail research-article">
    <header className="research-page-heading"><p className="research-eyebrow">STATISTICS · {snapshot.period}</p><h1>청년의 관계와 고립을 읽는 통계</h1><p>도움을 청할 관계, 외로움, 주관적인 고립감을 서로 구분해 살펴봅니다.</p><p>기준연도 {snapshot.period}년 · 원문 확인 <time dateTime={snapshot.checkedAt}>{snapshot.checkedAt}</time></p></header>
    <aside className="research-note"><h2>수치가 설명하는 범위부터 확인해 주세요</h2><p>세 통계는 고립·은둔청년의 인원이나 비율을 직접 조사한 값이 아닙니다. 연령 구간을 합쳐 19~34세 수치를 만들거나 대구의 고립·은둔청년 규모로 환산할 수 없습니다.</p><p>대구 값은 각 문항의 전체 연령에 대한 참고 자료입니다. 이번 조회에서 대구의 청년 연령대별 값은 제공되지 않아 전국 청년 수치와 나란히 비교하지 않았습니다.</p></aside>
    <nav className="research-tags" aria-label="통계표 바로가기">{snapshot.tables.map(table => <a key={table.id} href={`#${table.id}`}>{table.title} ↓</a>)}</nav>
    {snapshot.tables.map(table => <section id={table.id} key={table.id} className="research-stat-section"><p className="research-eyebrow">{table.survey}</p><h2>{table.title}</h2><p>{table.note}</p>
      <Values rows={table.rows.filter(row => row.region === '전국' && !row.population.startsWith('전체'))} caption="전국 연령대별 값" />
      <details className="research-stat-context"><summary>전체 연령의 참고값과 대구 자료 보기</summary><p>각 문항의 전체 연령을 나타냅니다. 위의 연령대별 값과 모집단이 다릅니다.</p><Values rows={table.rows.filter(row => row.region === '전국' && row.population.startsWith('전체'))} caption="전국 전체 연령" />
        {table.rows.some(row => row.region === '대구') ? <Values rows={table.rows.filter(row => row.region === '대구')} caption="대구 전체 연령 · 청년 수치 아님" /> : <p>이 통계표에는 대구 지역 구분이 없습니다.</p>}
      </details>
      <p className="research-stat-source"><a href={table.url} target="_blank" rel="noopener noreferrer">KOSIS 원 통계표 ↗</a><br />표 ID {table.id} · 수록 값 최종 수정일 {[...new Set(table.rows.map(row => row.updatedAt))].join(', ')}</p>
    </section>)}
    <section className="research-note"><h2>자료를 갱신하고 읽는 방법</h2><p>KOSIS OpenAPI에서 조회한 3개 표, 22개 값을 원문 주석과 대조해 게시했습니다. API 조회 시각은 {new Date(snapshot.fetchedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (한국시간)입니다. 화면은 확인일 기준의 검토본이며 새 통계 발표 후 다시 검토해 갱신합니다.</p><p>값은 원문 소수 자릿수를 유지했습니다. 미제공 값은 0으로 채우지 않습니다. 사회조사 표에 * 또는 **가 붙으면 상대표준오차가 각각 25~50% 미만, 50% 이상이라는 표시이므로 해석에 주의해야 합니다. 이번 게시 값에는 해당 표시가 없습니다.</p></section>
    <section><h2>통계를 현장의 질문으로 이어가기</h2><p>개인 지원의 변화는 국가 통계와 별도로, 본인이 원하는 도움과 경험을 함께 살펴야 합니다.</p><Link href="/research/notes/everyday-recovery-outcomes">일상과 관계의 회복을 기록하는 연구노트 →</Link></section>
  </article>;
}

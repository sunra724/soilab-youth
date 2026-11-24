import { Fragment } from 'react';
import { archive, sourceAttachment, type ArchiveEntry, type ArchiveSeries } from '@/lib/series-archive';
import { CardViewer } from './CardViewer';
import { ArchiveLink } from './ArchiveLink';
import './archive.css';

const seriesPath = (series: ArchiveSeries) => `/series/${series.slug}`;
const dateLabel = (value: string) => value.replaceAll('-', '.');

function Text({ value }: { value: string }) {
  return value.split(/\n+/).filter(Boolean).map((paragraph, i) => {
    const fragments = paragraph.split(/(https?:\/\/[^\s<>\[\]()]+)/g);
    return <p key={i}>{fragments.map((part, j) => /^https?:\/\//.test(part) ? <a key={j} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : <Fragment key={j}>{part}</Fragment>)}</p>;
  });
}

export function SeriesNavigation({ series, entry }: { series: ArchiveSeries; entry: ArchiveEntry }) {
  const position = series.entries.findIndex(item => item.id === entry.id);
  const previous = series.entries[position - 1], next = series.entries[position + 1];
  return <nav className="sa-next" aria-label="연재 이전·다음 편">
    <div>{previous ? <ArchiveLink href={previous.href} seriesSlug={series.slug} contentId={entry.id} kind="previous"><small>← 이전 편</small><strong>{previous.title}</strong></ArchiveLink> : <ArchiveLink href={seriesPath(series)} kind="contents"><small>연재 목차</small><strong>{series.title}</strong></ArchiveLink>}</div>
    <div>{next ? <ArchiveLink href={next.href} seriesSlug={series.slug} contentId={entry.id} kind="next"><small>다음 편 →</small><strong>{next.title}</strong></ArchiveLink> : <ArchiveLink href="/series" kind="index"><small>다른 이야기로</small><strong>모든 연재 보기 →</strong></ArchiveLink>}</div>
  </nav>;
}

export function OtherArchives() {
  return <aside className="sa-other"><h2>함께 읽는 소이랩의 이야기</h2><div>
    <ArchiveLink href="https://www.soilab-youth.kr/series" kind="cross_archive">청년 · 회복과 연결 ↗</ArchiveLink>
    <ArchiveLink href="https://care.soilabcoop.kr/series" kind="cross_archive">돌봄 · 동네와 일상 ↗</ArchiveLink>
    <ArchiveLink href="https://lab.soilabcoop.kr/series" kind="cross_archive">LAB · 현장과 정책 ↗</ArchiveLink>
  </div></aside>;
}

function SeriesCard({ series, index }: { series: ArchiveSeries; index: number }) {
  const first = series.entries[0];
  const count = series.entries.reduce((sum, entry) => sum + entry.cards.length, 0);
  return <article className="sa-series-card"><ArchiveLink className="sa-cover" href={seriesPath(series)} seriesSlug={series.slug} kind="series">
    <img src={first.cards[0].src} width={first.cards[0].width} height={first.cards[0].height} alt={`${series.title} 대표 카드`} loading="lazy" />
  </ArchiveLink><div className="sa-series-copy"><p className="sa-eyebrow">SERIES {String(index + 1).padStart(2, '0')} · {series.entries.length}건 · 이미지 {count}장</p>
    <h2><ArchiveLink href={seriesPath(series)} seriesSlug={series.slug} kind="series">{series.title}</ArchiveLink></h2><p>{series.description}</p>
    <ArchiveLink href={seriesPath(series)} seriesSlug={series.slug} kind="series" className="sa-text-link">목차와 이야기 읽기 →</ArchiveLink>
  </div></article>;
}

export function ArchiveIndex() {
  const total = archive.series.reduce((sum, series) => sum + series.entries.length, 0);
  return <div className="sa-archive" data-site={archive.site}>
    <header className="sa-hero sa-wrap"><p className="sa-eyebrow">SOILAB STORIES · {archive.site === '청년' ? 'YOUTH ARCHIVE' : 'LIVING LAB ARCHIVE'}</p>
      <h1>{archive.site === '청년' ? <>청년의 속도로,<br />이어가는 이야기</> : <>현장의 질문을,<br />다음 실행으로</>}</h1>
      <p className="sa-intro">{archive.description}</p><div className="sa-summary"><span>주제별 연재 <b>{archive.series.length}</b>개</span><span>원고·기록 <b>{total}</b>건</span><span>글·기획 <b>협동조합 소이랩</b></span></div>
    </header>
    <section className="sa-wrap sa-series-list" aria-label="전체 연재 목록">{archive.series.map((series, index) => <SeriesCard key={series.slug} series={series} index={index} />)}</section>
    <div className="sa-wrap"><p className="sa-archive-note">소이랩의 원고와 카드를 주제별 연재로 모았습니다. 기존 연구노트·포럼 기록과 함께 읽고, 각 글에서 근거와 관련 운영안으로 이어갈 수 있습니다.</p><OtherArchives /></div>
  </div>;
}

export function SeriesPreview() {
  return <section className="sa-archive sa-preview" data-site={archive.site} aria-label="소이랩 연재"><div className="sa-wrap">
    <div className="sa-section-heading"><div><p className="sa-eyebrow">SOILAB STORIES</p><h2>카드에서 시작해, 글로 이어갑니다</h2></div><ArchiveLink href="/series" kind="index" className="sa-text-link">전체 연재 보기 →</ArchiveLink></div>
    <div className="sa-preview-grid">{archive.series.map((series, index) => <SeriesCard key={series.slug} series={series} index={index} />)}</div>
  </div></section>;
}

export function SeriesOverview({ series }: { series: ArchiveSeries }) {
  return <div className="sa-archive" data-site={archive.site}><div className="sa-wrap">
    <header className="sa-series-heading"><ArchiveLink href="/series" kind="index" className="sa-back">← 전체 연재</ArchiveLink><p className="sa-eyebrow">SOILAB SERIES · {series.entries.length}건</p><h1>{series.title}</h1><p className="sa-subtitle">{series.subtitle}</p><p className="sa-intro">{series.description}</p><ArchiveLink href={series.entries[0].href} kind="start" seriesSlug={series.slug} className="sa-button">첫 이야기부터 읽기 →</ArchiveLink></header>
    <section className="sa-episode-list" aria-label="연재 목차">{series.entries.map(entry => <article key={entry.id}>
      <ArchiveLink href={entry.href} kind="episode" seriesSlug={series.slug} contentId={entry.id} className="sa-episode-cover"><img src={entry.cards[0].src} width={entry.cards[0].width} height={entry.cards[0].height} alt={`${entry.title} 표지`} loading="lazy" /></ArchiveLink>
      <div><p className="sa-eyebrow">{String(entry.number).padStart(2, '0')} · {entry.videos.length ? '영상·원고' : entry.id === 'L05' ? '사진·행사 기록' : `카드뉴스 ${entry.cards.length}장`}</p><h2><ArchiveLink href={entry.href} kind="episode" seriesSlug={series.slug} contentId={entry.id}>{entry.title}</ArchiveLink></h2><p>{entry.description}</p><p className="sa-small">원고 기준 {dateLabel(entry.date)}</p><ArchiveLink href={entry.href} kind="episode" seriesSlug={series.slug} contentId={entry.id} className="sa-text-link">원고와 카드 읽기 →</ArchiveLink></div>
    </article>)}</section><OtherArchives />
  </div></div>;
}

function Related({ entry, series }: { entry: ArchiveEntry; series: ArchiveSeries }) {
  return entry.related.length ? <aside className="sa-related"><p className="sa-eyebrow">이야기에서 다음 걸음으로</p><h2>관련 자료·운영안</h2><ul>{entry.related.map(link => <li key={link.href}><ArchiveLink href={link.href} seriesSlug={series.slug} contentId={entry.id} kind="related">{link.label} →</ArchiveLink></li>)}</ul></aside> : null;
}

function Media({ entry }: { entry: ArchiveEntry }) {
  return <><CardViewer cards={entry.cards} title={entry.title} />{entry.videos.map(video => <figure className="sa-video" key={video.src}><video controls preload="metadata" playsInline poster={entry.cards[0].src} aria-label={video.label}><source src={video.src} type="video/mp4" /><a href={video.src}>영상 내려받기</a></video><figcaption>{video.label}</figcaption></figure>)}<a href={entry.download} download className="sa-download">카드·첨부 원본 ZIP 내려받기 ↓</a></>;
}

export function ArchiveArticle({ series, entry }: { series: ArchiveSeries; entry: ArchiveEntry }) {
  const canonical = new URL(entry.canonicalPath || entry.path, archive.baseUrl).toString();
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: entry.title, description: entry.description, mainEntityOfPage: canonical, dateCreated: entry.date <= entry.archivedAt ? `${entry.date}T00:00:00+09:00` : undefined, datePublished: `${entry.archivedAt}T00:00:00+09:00`, dateModified: `${entry.archivedAt}T00:00:00+09:00`, inLanguage: 'ko-KR', image: entry.cards.map(card => new URL(card.src, archive.baseUrl).toString()), author: { '@type': 'Organization', name: '협동조합 소이랩', url: 'https://www.soilabcoop.kr' }, isPartOf: { '@type': 'CreativeWorkSeries', name: series.title, url: new URL(seriesPath(series), archive.baseUrl).toString() } };
  return <article className="sa-archive" data-site={archive.site}><div className="sa-wrap">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <header className="sa-article-heading"><ArchiveLink href={seriesPath(series)} kind="contents" className="sa-back">← {series.title}</ArchiveLink><p className="sa-eyebrow">{String(entry.number).padStart(2, '0')} / {series.entries.length} · SOILAB STORIES</p><h1>{entry.title}</h1><p className="sa-intro">{entry.description}</p><p className="sa-small">글·기획 협동조합 소이랩 · 원고 기준 <time dateTime={entry.date}>{dateLabel(entry.date)}</time> · 아카이브 등록 <time dateTime={entry.archivedAt}>{dateLabel(entry.archivedAt)}</time></p><nav className="sa-jump" aria-label="본문 바로가기"><a href="#series-cardnews">카드뉴스 보기</a><a href="#manuscript">원고 읽기</a><a href="#references">참고자료</a></nav></header>
    <div className="sa-content-grid"><section id="series-cardnews" className="sa-media-section"><h2 className="sa-sr-only">카드뉴스</h2><Media entry={entry} /></section><div className="sa-reader">
      {entry.notice && <aside className="sa-notice">{entry.notice}</aside>}
      <section id="manuscript" className="sa-manuscript"><h2>원고 읽기</h2><Text value={entry.body} /></section>
      {entry.tags.length > 0 && <p className="sa-tags">{entry.tags.map(tag => <span key={tag}>#{tag}</span>)}</p>}
      <section id="references" className="sa-references"><h2>참고자료</h2><ul>{entry.sources.map((source, index) => <li key={index}>{source.href ? <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a> : source.label}</li>)}</ul></section>
      <Related entry={entry} series={series} />
    </div></div><SeriesNavigation series={series} entry={entry} /><OtherArchives />
  </div></article>;
}

export function SeriesAttachment({ sourcePath, showCards = true }: { sourcePath: string; showCards?: boolean }) {
  const match = sourceAttachment(sourcePath);
  if (!match) return null;
  const { series, entry } = match;
  return <aside id="series-cardnews" className="sa-archive sa-attachment" data-site={archive.site}>
    <header><p className="sa-eyebrow">함께 읽는 소이랩 연재 · {entry.number} / {series.entries.length}</p><h2>{series.title}</h2><p>{entry.description}</p><ArchiveLink href={seriesPath(series)} seriesSlug={series.slug} kind="contents" className="sa-text-link">연재 목차 보기 →</ArchiveLink></header>
    {showCards && <><Media entry={entry} /><details className="sa-original"><summary>원고 함께 읽기</summary><div className="sa-manuscript"><Text value={entry.body} /></div></details></>}
    <SeriesNavigation series={series} entry={entry} />
  </aside>;
}

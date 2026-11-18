'use client';

import { useState } from 'react';
import type { ArchiveCard } from '@/lib/series-archive';

export function CardViewer({ cards, title }: { cards: ArchiveCard[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!cards.length) return null;
  const card = cards[index];
  return <div className="sa-viewer" role="region" aria-label={`${title} 카드뉴스`} tabIndex={0} onKeyDown={event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); setIndex(value => Math.max(0, value - 1)); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setIndex(value => Math.min(cards.length - 1, value + 1)); }
  }}>
    <div className="sa-viewer-controls">
      <button type="button" onClick={() => setIndex(value => value - 1)} disabled={index === 0} aria-label="이전 카드">← 이전</button>
      <span aria-live="polite" aria-atomic="true">{index + 1} / {cards.length}</span>
      <button type="button" onClick={() => setIndex(value => value + 1)} disabled={index === cards.length - 1} aria-label="다음 카드">다음 →</button>
    </div>
    <figure className="sa-current-card">
      <a href={card.src} target="_blank" rel="noopener noreferrer" aria-label={`${index + 1}번 카드 크게 보기`}>
        <img src={card.src} width={card.width} height={card.height} alt={card.alt} decoding="async" />
      </a>
      <figcaption>{card.caption} · 이미지를 누르면 크게 볼 수 있습니다.</figcaption>
    </figure>
    {cards.length > 1 && <div className="sa-thumbnails" aria-label="카드 선택">{cards.map((item, number) => <button key={item.src} type="button" aria-label={`${number + 1}번 카드 보기`} aria-pressed={index === number} onClick={() => setIndex(number)}>
      <img src={item.src} width={item.width} height={item.height} alt="" loading="lazy" /><span>{number + 1}</span>
    </button>)}</div>}
    <p className="sa-small">카드 영역에서 키보드 좌우 화살표로도 넘길 수 있습니다.</p>
  </div>;
}

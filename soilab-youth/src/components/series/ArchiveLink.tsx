'use client';

import type { AnchorHTMLAttributes } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { kind?: string; seriesSlug?: string; contentId?: string };

export function ArchiveLink({ kind = 'related', seriesSlug, contentId, onClick, children, ...props }: Props) {
  return <a {...props} onClick={event => {
    const metrics = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      plausible?: (event: string, options: { props: Record<string, string> }) => void;
    };
    const detail = { series_slug: seriesSlug ?? 'index', content_id: contentId ?? 'index', navigation_type: kind };
    metrics.gtag?.('event', 'series_navigation', detail);
    metrics.plausible?.('Series navigation', { props: detail });
    onClick?.(event);
  }}>{children}</a>;
}

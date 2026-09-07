import type { Metadata } from 'next';

export const SITE_NAME = '협동조합 소이랩 고립·은둔 청년 지원센터';
export const SITE_DESCRIPTION = '대구 지역 고립·은둔 청년을 발굴하고 회복을 지원합니다. 132명의 쉼청년과 함께 걸어온 협동조합 소이랩입니다.';
export const DEFAULT_OG_IMAGE = '/opengraph-image';

interface PageMetadataParams {
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'article';
  siteName?: string;
  image?: string;
  imageAlt?: string;
  publishedTime?: string;
}

export function pageMetadata({
  path,
  title,
  description,
  type = 'website',
  siteName = SITE_NAME,
  image = DEFAULT_OG_IMAGE,
  imageAlt = title,
  publishedTime,
}: PageMetadataParams): Metadata {
  const images = [{
    url: image,
    width: 1200,
    height: 630,
    alt: imageAlt,
  }];
  const sharedOpenGraph = {
    locale: 'ko_KR',
    url: path,
    siteName,
    title,
    description,
    images,
  };
  const openGraph: Metadata['openGraph'] = type === 'article'
    ? {
      ...sharedOpenGraph,
      type: 'article',
      ...(publishedTime ? { publishedTime } : {}),
    }
    : {
      ...sharedOpenGraph,
      type: 'website',
    };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

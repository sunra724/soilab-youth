import type { Metadata } from 'next';

export const SITE_NAME = '협동조합 소이랩 고립·은둔 청년 지원센터';
export const SITE_DESCRIPTION = '대구 지역 청년의 일상회복과 사회연결을 함께하는 협동조합 소이랩입니다. 청년다다름 대구제작소·청년 탄탄대로 운영 안내와 기관 협력 범위, 2025년 공개 실적을 확인하세요.';
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

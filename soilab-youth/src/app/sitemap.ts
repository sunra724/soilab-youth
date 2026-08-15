import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.soilab-youth.kr';

  return [
    { url: baseUrl, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/livinglab`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/cardnews`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/newsletter`, changeFrequency: 'daily', priority: 0.7 },
  ];
}

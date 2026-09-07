export interface CardNews {
  id: string;
  title: string;
  category: string;
  project: string;
  publishedAt: string;
  thumbnailColor: string;
  summary: string;
  externalUrl: string;
}

export interface Newsletter {
  id: string;
  title: string;
  issueNumber: number;
  publishedAt: string;
  summary: string;
  pdfUrl: string;
}

export interface NewsletterArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface NewsletterDetail extends Newsletter {
  articles: NewsletterArticle[];
}

export interface StatItem {
  id: string;
  name: string;
  value: number;
  unit: string;
  description: string;
}

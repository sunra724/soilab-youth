export const CARDNEWS_PROPS = {
  title: '제목',
  category: '카테고리',
  project: '사업',
  publishedAt: '발행일',
  thumbnailColor: '썸네일색상',
  summary: '요약',
  externalUrl: '외부링크',
  isPublic: '공개',
} as const;

export const NEWSLETTER_PROPS = {
  title: '제목',
  issueNumber: '발행호수',
  publishedAt: '발행일',
  summary: '요약',
  pdfUrl: 'PDF링크',
  isPublic: '공개',
} as const;

export const STATS_PROPS = {
  isActive: '활성',
  order: '순서',
  name: '지표명',
  value: '수치',
  unit: '단위',
  description: '설명',
} as const;

export const CANDIDATE_PROPS = {
  title: '제목',
  url: '원문링크',
  source: '출처',
  collectedAt: '수집일',
  summary: '요약',
  category: '카테고리',
  isSelected: '발송선택',
  isSent: '발송완료',
} as const;

export const CANDIDATE_CATEGORIES = {
  isolationYouth: '고립은둔',
  youthSupport: '청년지원',
  socialEconomy: '사회적경제',
  other: '기타',
} as const;

export const YOUTH_POLICY_BRIEFING_NAME = '소이랩 위기청년 정책 브리핑';
export const YOUTH_POLICY_BRIEFING_SCOPE = '고립·은둔 · 가족돌봄 · 자립준비 · 탈가정·가정 밖 청년';

// Use the same domestic scope at RSS collection and after reading the source.
export function crisisYouthPolicyScope(value: string) {
  const text = value.normalize('NFKC').toLowerCase().replace(/[\s·ㆍ・‧,/_-]+/gu, '');
  if (/위기(?:아동(?:및)?)?청(?:소)?년|청년미래센터|영케어러|youngcarer|히키코모리|보호종료(?:아동|청년)|보호연장(?:아동|청년)|자립지원전담기관|청소년(?:쉼터|자립지원관)/u.test(text)) return true;
  return /청년|청소년|은둔형외톨이|히키코모리/u.test(text)
    && /고립|은둔|가족돌봄|가족간병|부모간병|자립준비|탈가정|가정밖|쉼터퇴소/u.test(text);
}

// Separate queries keep one topic's headlines from filling every feed slot.
export const YOUTH_POLICY_DOMESTIC_FEEDS = [
  { id: 'kr_policy', name: '고립·은둔 정책 동향', query: '("고립청년" OR "고립 청년" OR "은둔청년" OR "은둔 청년") (정책 OR 연구 OR 예산 OR 지원)' },
  { id: 'kr_crisis', name: '위기청년 정책 동향', query: '("위기청년" OR "위기 청년" OR "위기아동 청년" OR "위기아동·청년" OR "청년미래센터") (정책 OR 연구 OR 예산 OR 지원)' },
  { id: 'kr_family', name: '가족돌봄 지원', query: '("가족돌봄청년" OR "가족 돌봄 청년" OR "가족돌봄청소년" OR "영케어러") (정책 OR 연구 OR 지원)' },
  { id: 'kr_independence', name: '자립준비 지원', query: '("자립준비청년" OR "자립 준비 청년" OR "보호종료아동" OR "자립지원전담기관") (정책 OR 연구 OR 지원)' },
  { id: 'kr_out_of_home', name: '탈가정·가정 밖 청년 지원', query: '("탈가정청년" OR "탈가정 청년" OR "가정 밖 청소년" OR "가정 밖 청년" OR "쉼터 퇴소 청년" OR "청소년자립지원관") (정책 OR 연구 OR 지원)' },
] as const;

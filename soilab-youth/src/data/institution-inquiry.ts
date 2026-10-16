export function youthBusinessInquiryHref() {
  const body = [
    '안녕하세요. 청년지원 사업의 기획·운영 협력을 문의합니다.', '',
    '기관명:', '담당자 / 회신 연락처:', '운영 지역:',
    '현재 사업 단계:', '지원하려는 대상과 예상 규모:', '희망 일정:',
    '맡기고 싶은 업무:', '필요한 결과물:', '예산 범위(선택):', '',
    '참여자의 이름·건강정보 등 개인 사례는 문의에 적지 말아 주세요.',
  ].join('\n');
  return `mailto:soilabcoop@gmail.com?subject=${encodeURIComponent('[기관 사업 문의] 청년지원 사업 기획·운영')}&body=${encodeURIComponent(body)}`;
}

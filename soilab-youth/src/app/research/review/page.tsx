import type { Metadata } from 'next';
import SourceReview from '@/components/research/SourceReview';

export const metadata: Metadata = { title: '정책자료 검토함', robots: { index: false, follow: false } };
export default function ReviewPage() {
  return <section className="research-wrap research-section"><div className="research-page-heading"><p className="research-eyebrow">EDITORIAL REVIEW</p><h1>정책자료 검토함</h1><p>수집된 연구와 법령을 읽고, 청년지원 현장에 연결할 내용과 확인 범위를 기록합니다.</p></div>
    <details className="research-note"><summary>자료를 검토하고 발행하는 순서</summary><ol className="research-guide-list"><li>원문에서 발행기관·대상 연령·발행일과 실제 읽은 쪽수를 확인합니다.</li><li>자료가 설명하는 사실, 현장에서 검토할 제안, 적용 한계를 각각 작성합니다.</li><li>청년센터에서는 상담·가족지원·회복에 연결할 질문을 중심으로 검토합니다. 돌봄 아카이브는 서비스 설계·현장 근거, 영업 포털은 기관 과제·사업 제안으로 별도 편집합니다.</li><li>아직 확인할 내용이 남으면 ‘대기로 저장’, 확인을 마친 자료는 ‘검토 완료·공개’를 선택합니다. 공개 자료도 대기로 되돌려 수정할 수 있습니다.</li></ol><p>이 검토함은 정책·근거 자료를 관리합니다. 연구노트·지원 안내·통계는 별도 원고 검토와 사이트 배포로 갱신합니다.</p></details>
    <SourceReview /></section>;
}

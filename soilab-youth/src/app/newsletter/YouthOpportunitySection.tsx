import {
  getYouthOpportunities,
} from '@/lib/youthOpportunities';
import type {
  YouthCenterInformation,
  YouthContentInformation,
  YouthPolicyInformation,
} from '@/lib/youthInformation';
import { formatDate } from '@/lib/utils';

function PolicyCard({ item }: { item: YouthPolicyInformation }) {
  return (
    <article
      className="rounded-xl border border-white bg-white p-4 shadow-sm"
      data-youth-policy
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <span className="rounded-full bg-[#e8f4fd] px-2.5 py-1 text-[#248DAC]">
          {item.region}
        </span>
        <span className="text-gray-400">{item.category || '청년정책'}</span>
      </div>
      <h4 className="mt-2 text-sm font-bold leading-6 text-gray-900">
        {item.title}
      </h4>
      <dl className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
        <div>
          <dt className="inline font-bold text-gray-800">신청 기간 · </dt>
          <dd className="inline">{item.applicationPeriod}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-gray-800">대상 · </dt>
          <dd className="inline">{item.eligibility}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-gray-800">지원 · </dt>
          <dd className="inline">{item.benefit}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-gray-400">{item.organization}</p>
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex text-xs font-bold text-[#248DAC] underline"
      >
        온통청년 정책 원문 보기 →
      </a>
    </article>
  );
}

function ContentItem({ item }: { item: YouthContentInformation }) {
  return (
    <li
      className="rounded-xl border border-white bg-white p-4 shadow-sm"
      data-youth-content
    >
      <p className="text-[11px] font-bold text-[#2F6B57]">
        {item.category} · {item.publishedAt ? formatDate(item.publishedAt) : '등록일 확인'}
      </p>
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 block text-sm font-bold leading-6 text-gray-900 hover:text-[#248DAC] hover:underline"
      >
        {item.title}
      </a>
    </li>
  );
}

function CenterItem({ item }: { item: YouthCenterInformation }) {
  const phoneHref = item.phone
    ? `tel:${item.phone.replace(/[^\d+]/gu, '')}`
    : '';

  return (
    <li
      className="rounded-xl border border-white bg-white p-4 shadow-sm"
      data-youth-center
    >
      <p className="text-[11px] font-bold text-[#C4694F]">{item.district}</p>
      <h4 className="mt-1.5 text-sm font-bold leading-6 text-gray-900">{item.name}</h4>
      <p className="mt-2 text-xs leading-5 text-gray-500">{item.address}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
        {phoneHref && (
          <a href={phoneHref} className="text-gray-700 underline">
            {item.phone}
          </a>
        )}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#248DAC] underline"
        >
          센터 홈페이지 →
        </a>
      </div>
    </li>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white bg-white p-4 text-xs leading-5 text-gray-500">
      {children}
    </div>
  );
}

export default async function YouthOpportunitySection() {
  const feed = await getYouthOpportunities();
  const hasDaeguPolicy = feed.policies.some((item) => item.region === '대구');

  return (
    <section
      className="mt-12 rounded-2xl border border-[#d6e7ed] bg-[#f4fafb] p-6"
      data-youth-api-source="ontong"
    >
      <p className="text-xs font-bold tracking-[0.1em] text-[#248DAC]">
        OFFICIAL YOUTH INFORMATION
      </p>
      <h2 className="mt-2 text-lg font-bold text-gray-900">
        청년정책·콘텐츠·대구 청년센터
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        온통청년 공식 OPEN API에서 대구와 전국의 청년정책, 최신 콘텐츠,
        대구 지역 청년센터 정보를 6시간 간격으로 불러옵니다.
        신청하거나 방문하기 전에는 공식 원문에서 최신 내용을 확인해 주세요.
      </p>

      <div className="mt-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">지금 확인할 청년정책</h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              고립·은둔 청년의 회복과 자립에 직접 도움이 되는 정책만 표시합니다.
            </p>
            {feed.policies.length > 0 && !hasDaeguPolicy && (
              <p
                className="mt-1 text-xs font-semibold leading-5 text-amber-700"
                data-no-daegu-policy
              >
                현재 표시할 대구 정책이 없어 전국 정책만 안내합니다.
              </p>
            )}
          </div>
          <a
            href="https://www.youthcenter.go.kr/youthPolicy/ythPlcyTotalSearch"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-bold text-[#248DAC] underline"
          >
            전체 검색 →
          </a>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {feed.policies.length > 0
            ? feed.policies.map((item) => <PolicyCard key={item.id} item={item} />)
            : (
              <EmptyState>
                현재 표시할 고립·은둔 청년 관련 정책이 없습니다.
              </EmptyState>
            )}
        </div>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">최신 청년콘텐츠</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            온통청년에 새로 등록된 참여 정보와 정책 소식입니다.
          </p>
          <ul className="mt-3 space-y-3">
            {feed.contents.length > 0
              ? feed.contents.map((item) => <ContentItem key={item.id} item={item} />)
              : (
                <li>
                  <EmptyState>최신 콘텐츠 정보를 확인 중입니다.</EmptyState>
                </li>
              )}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900">대구 청년센터</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            소이랩 상담번호가 아닌, 온통청년에 등록된 지역 청년센터 연락처입니다.
          </p>
          <ul className="mt-3 space-y-3">
            {feed.centers.length > 0
              ? feed.centers.map((item) => <CenterItem key={item.id} item={item} />)
              : (
                <li>
                  <EmptyState>대구 청년센터 정보를 확인 중입니다.</EmptyState>
                </li>
              )}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#d6e7ed] pt-4 text-xs text-gray-500">
        <span>자료원: {feed.sourceName}</span>
        <a
          href="https://www.youthcenter.go.kr/cmnFooter/openapiIntro/oaiDoc"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#248DAC] underline"
        >
          OPEN API 제공목록 →
        </a>
        {feed.errors.length > 0 && (
          <span className="text-amber-700">일부 자료는 다음 갱신 때 다시 확인합니다.</span>
        )}
      </div>
    </section>
  );
}

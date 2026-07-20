'use client';

import { useState } from 'react';
import type { FaqItem } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

export default function LivingLabFaq({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title="자주 묻는 질문"
          description="지역 실증사업을 협의하기 전에 많이 확인하는 내용을 정리했습니다."
          centered
        />

        <div className="mt-10 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-5 shadow-sm sm:px-7">
          {items.map((item) => {
            const expanded = item.id === openId;
            const buttonId = `faq-button-${item.id}`;
            const panelId = `faq-panel-${item.id}`;

            return (
              <div key={item.id}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpenId(expanded ? null : item.id)}
                    className="flex min-h-14 w-full items-center justify-between gap-5 py-5 text-left font-bold text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                  >
                    <span>{item.question}</span>
                    <span aria-hidden="true" className={`shrink-0 text-xl text-navy transition-transform ${expanded ? 'rotate-45' : ''}`}>+</span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!expanded}
                  className="pb-6 pr-8 text-sm leading-7 text-gray-600"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

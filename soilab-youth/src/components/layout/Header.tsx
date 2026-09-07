'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '소개', href: '/#about' },
  { label: '사업', href: '/#programs' },
  { label: '리빙랩', href: '/livinglab' },
  { label: '정책·연구', href: '/research' },
  { label: '성과', href: '/#stats' },
  { label: '소식', href: '/cardnews' },
  { label: '뉴스레터', href: '/newsletter' },
  { label: '문의', href: '/#contact' },
  {
    label: 'CSR',
    href: 'https://csr.soilab-youth.kr',
    accent: true,
    external: true,
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isNewsletterRoute = pathname.startsWith('/newsletter')
    || pathname === '/unsubscribe';
  const contactHref = isNewsletterRoute
    ? 'mailto:youth-news@soilabcoop.kr'
    : '/#contact';
  const contactLabel = isNewsletterRoute ? '뉴스레터 문의' : '사업·협력 문의';

  const isCurrent = (href: string) => {
    if (href === '/research') return pathname.startsWith('/research');
    if (href === '/livinglab') return pathname === '/livinglab';
    if (href === '/cardnews') return pathname.startsWith('/cardnews');
    if (href === '/newsletter') return pathname.startsWith('/newsletter');
    return false;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
               style={{ background: '#46549C' }}>
            🌱
          </div>
          <div>
            <span className="font-bold text-base" style={{ color: '#46549C' }}>협동조합 소이랩</span>
            <span className="text-xs text-gray-500 block leading-none">고립·은둔 청년지원센터</span>
          </div>
        </Link>

        {/* 데스크탑 Nav */}
        <nav className="hidden lg:flex items-center gap-5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={
                item.accent
                  ? `rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                      isCurrent(item.href)
                        ? 'border-navy bg-navy text-white'
                        : 'border-navy/25 bg-navy/5 text-navy hover:bg-navy hover:text-white'
                    }`
                  : `text-sm hover:text-navy font-medium transition-colors ${
                      isCurrent(item.href) ? 'text-navy' : 'text-gray-700'
                    }`
              }
            >
              {item.label}
            </Link>
          ))}
          <a
            href={contactHref}
            className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#46549C' }}
          >
            {contactLabel}
          </a>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="lg:hidden p-2 rounded-lg text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={`block py-3 text-sm border-b border-gray-50 font-medium ${
                item.accent
                  ? 'text-navy font-bold'
                  : isCurrent(item.href)
                    ? 'text-navy'
                    : 'text-gray-700'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.accent ? 'CSR 전용 홈페이지 ↗' : item.label}
            </Link>
          ))}
          <a
            href={contactHref}
            className="mt-3 block w-full text-center py-3 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#46549C' }}
          >
            {contactLabel}
          </a>
        </div>
      )}
    </header>
  );
}

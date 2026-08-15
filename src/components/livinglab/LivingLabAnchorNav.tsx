interface AnchorItem {
  label: string;
  href: string;
}

export default function LivingLabAnchorNav({ items }: { items: AnchorItem[] }) {
  return (
    <nav
      aria-label="리빙랩 페이지 내 이동"
      className="sticky top-16 z-40 border-y border-gray-100 bg-white/95 shadow-sm backdrop-blur"
    >
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
        <ul className="flex min-w-max items-center gap-1 py-2">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-cream hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

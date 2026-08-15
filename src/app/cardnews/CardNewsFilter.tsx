'use client';

import { useRouter, usePathname } from 'next/navigation';

const CATEGORIES = ['전체', '카드뉴스', '활동소식', '공지'];
const PROJECTS   = ['전체', '고립은둔청년', '청년다다름'];

interface Props {
  currentCategory: string;
  currentProject: string;
}

export default function CardNewsFilter({ currentCategory, currentProject }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function update(key: 'category' | 'project', value: string) {
    const params = new URLSearchParams();
    if (key === 'category') {
      if (value !== '전체') params.set('category', value);
      if (currentProject !== '전체') params.set('project', currentProject);
    } else {
      if (currentCategory !== '전체') params.set('category', currentCategory);
      if (value !== '전체') params.set('project', value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* 카테고리 탭 */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update('category', cat)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              currentCategory === cat
                ? { background: '#46549C', color: '#fff' }
                : { background: '#F3F4F6', color: '#6B7280' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 사업 셀렉트 */}
      <select
        value={currentProject}
        onChange={(e) => update('project', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
      >
        {PROJECTS.map((p) => (
          <option key={p} value={p}>{p === '전체' ? '전체 사업' : p}</option>
        ))}
      </select>
    </div>
  );
}

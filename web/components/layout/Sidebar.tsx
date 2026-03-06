import Link from 'next/link';
import type { Category } from '@/types/skill';

interface SidebarProps {
  categories: Category[];
  activeCategory?: string;
}

export function Sidebar({ categories, activeCategory }: SidebarProps) {
  return (
    <aside className="w-52 shrink-0">
      <div className="sticky top-20">
        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-widest text-[#484f58]">
          分類
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/skills"
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all ${
                !activeCategory
                  ? 'bg-[#3fb950]/8 text-[#3fb950] border border-[#3fb950]/20'
                  : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3] border border-transparent'
              }`}
            >
              <span className="font-medium">全部 Skills</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categories/${cat.id}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#3fb950]/8 text-[#3fb950] border border-[#3fb950]/20'
                    : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3] border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[11px] rounded px-1.5 py-0.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#3fb950]/15 text-[#3fb950]'
                    : 'bg-[#21262d] text-[#484f58]'
                }`}>
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

import Link from 'next/link';
import type { Category } from '@/types/skill';

interface SidebarProps {
  categories: Category[];
  activeCategory?: string;
}

export function Sidebar({ categories, activeCategory }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0">
      <div className="sticky top-24">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          分類
        </h2>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/skills"
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                !activeCategory
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>全部 Skills</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categories/${cat.id}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-xs text-slate-600">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

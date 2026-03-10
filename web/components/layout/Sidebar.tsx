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
        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          分類
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/skills"
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] ${
                !activeCategory
                  ? 'bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-[var(--color-accent)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] border border-transparent'
              }`}
            >
              <span className="font-medium">全部 Skills</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categories/${cat.id}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] ${
                  activeCategory === cat.id
                    ? 'bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-[var(--color-accent)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[11px] rounded px-1.5 py-0.5 ${
                  activeCategory === cat.id
                    ? 'bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
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

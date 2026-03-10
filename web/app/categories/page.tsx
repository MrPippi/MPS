import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getAllSkills } from '@/features/skills';
import { SITE_NAME } from '@/lib/utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

export const metadata: Metadata = {
  title: `分類瀏覽 | ${SITE_NAME}`,
  description: '依分類瀏覽 Minecraft Plugin Skills，包含 API 整合、骨架生成、配置管理、指令系統等分類。',
};

export default function CategoriesPage() {
  const categories = getCategories();
  const allSkills = getAllSkills();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">分類</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">分類瀏覽</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          共 {categories.length} 個分類 · {allSkills.length} 個 Skills
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const skills = allSkills.filter((s) => s.category === cat.id);
          const activeCount = skills.filter((s) => s.status === 'active').length;

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-6 transition-all hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] card-hover focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-accent)] group-hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] transition-all">
                <CategoryIcon category={cat.id} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {cat.label}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{cat.labelEn}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)]">{cat.count} 個 Skills</span>
                  {activeCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
                      {activeCount} 個已發布
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

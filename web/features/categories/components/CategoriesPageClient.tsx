'use client';

import Link from 'next/link';
import type { Category } from '@/shared/types/skill';
import { CategoryIcon } from '@/features/categories';
import { useLanguage } from '@/shared/i18n';

interface CategoriesPageClientProps {
  categories: Category[];
  skillCount: number;
  countsByCategory: Record<string, { total: number; active: number }>;
}

export function CategoriesPageClient({ categories, skillCount, countsByCategory }: CategoriesPageClientProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">{t.categories.pageLabel}</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{t.categories.pageTitle}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {t.categories.pageSubtitle
            .replace('{catCount}', String(categories.length))
            .replace('{skillCount}', String(skillCount))}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const counts = countsByCategory[cat.id] ?? { total: 0, active: 0 };
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-6 transition-all hover:border-accent-dim card-hover focus-ring"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-accent)] group-hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] transition-all">
                <CategoryIcon category={cat.id} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {lang === 'en' ? cat.labelEn : cat.label}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {lang === 'en' ? cat.label : cat.labelEn}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {t.categories.skillsCount.replace('{count}', String(counts.total))}
                  </span>
                  {counts.active > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
                      {t.categories.activeCount.replace('{count}', String(counts.active))}
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

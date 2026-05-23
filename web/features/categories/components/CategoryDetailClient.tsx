'use client';

import Link from 'next/link';
import type { Category, SkillMeta } from '@/shared/types/skill';
import { SkillGrid } from '@/features/skills/components/SkillGrid';
import { Sidebar } from './Sidebar';
import { useLanguage } from '@/shared/i18n';

interface CategoryDetailClientProps {
  cat: Category;
  skills: SkillMeta[];
  categories: Category[];
}

export function CategoryDetailClient({ cat, skills, categories }: CategoryDetailClientProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-[var(--color-border)] pb-8">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4">
          <Link href="/categories" className="hover:text-[var(--color-accent)] transition-colors focus-ring rounded">
            {t.categoryDetail.breadcrumb}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)]">
            {lang === 'en' ? cat.labelEn : cat.label}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {lang === 'en' ? cat.labelEn : cat.label}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {t.categoryDetail.subtitle
            .replace('{labelEn}', lang === 'en' ? cat.label : cat.labelEn)
            .replace('{count}', String(skills.length))}
        </p>
      </div>

      <div className="flex gap-10">
        <div className="hidden lg:block">
          <Sidebar categories={categories} activeCategory={cat.id} />
        </div>
        <div className="flex-1 min-w-0">
          <SkillGrid skills={skills} emptyMessage={t.categoryDetail.emptyMessage} />
        </div>
      </div>
    </div>
  );
}

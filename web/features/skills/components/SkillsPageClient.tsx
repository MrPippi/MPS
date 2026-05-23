'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import type { SkillMeta, Category } from '@/shared/types/skill';
import { SkillBadge } from './SkillBadge';
import { SkillGrid } from './SkillGrid';
import { CategoryIcon } from '@/features/categories';
import { formatDate } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/i18n';

type ViewMode = 'grid' | 'list';

interface SkillsPageClientProps {
  skills: SkillMeta[];
  categories: Category[];
}

export function SkillsPageClient({ skills, categories }: SkillsPageClientProps) {
  const { t, lang } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredSkills = useMemo(() => {
    if (selectedCategories.length === 0) return skills;
    return skills.filter((s) => selectedCategories.includes(s.category));
  }, [skills, selectedCategories]);

  function toggleCategory(catId: string) {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">{t.skills.pageLabel}</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{t.skills.pageTitle}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {t.skills.pageSubtitle.replace('{count}', String(skills.length))}
        </p>
      </div>

      {/* Filter bar + view toggle */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategories([])}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
            selectedCategories.length === 0
              ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent)] border-accent-soft'
              : 'text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:text-[var(--color-text)]'
          }`}
        >
          {t.skills.filterAll}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
              selectedCategories.includes(cat.id)
                ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent)] border-accent-soft'
                : 'text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:text-[var(--color-text)]'
            }`}
          >
            {lang === 'en' ? cat.labelEn : cat.label}
            <span className="ml-1.5 text-[var(--color-text-muted)]">{cat.count}</span>
          </button>
        ))}

        {/* View mode toggle */}
        <div className="ml-auto flex items-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-[var(--color-border-strong)] text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            aria-label={t.skills.gridView}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-[var(--color-border-strong)] text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            aria-label={t.skills.listView}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <SkillGrid skills={filteredSkills} />
      ) : (
        <SkillListView skills={filteredSkills} />
      )}
    </div>
  );
}

function SkillListView({ skills }: { skills: SkillMeta[] }) {
  const { t, lang } = useLanguage();
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-[var(--color-border-strong)]">
        <p className="text-sm text-[var(--color-text-muted)]">{t.skills.emptyState}</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] overflow-hidden">
      {skills.map((skill) => (
        <Link
          key={skill.id}
          href={`/skills/${skill.slug}`}
          className="flex items-center gap-4 px-5 py-3.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors group"
        >
          <CategoryIcon category={skill.category} className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
              {lang === 'en' ? skill.title : skill.titleZh}
            </span>
            <span className="ml-2 text-xs text-[var(--color-text-muted)] font-mono">
              {lang === 'en' ? skill.titleZh : skill.title}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0">v{skill.version}</span>
          <SkillBadge status={skill.status} />
          {skill.updatedAt && (
            <span className="hidden sm:block text-xs text-[var(--color-text-muted)] shrink-0">
              {formatDate(skill.updatedAt, lang === 'en' ? 'en-US' : 'zh-TW')}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

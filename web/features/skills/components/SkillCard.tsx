'use client';

import Link from 'next/link';
import type { SkillMeta } from '@/shared/types/skill';
import { SkillBadge } from './SkillBadge';
import { formatDate } from '@/shared/lib/utils';
import { CategoryIcon } from '@/features/categories';
import { useLanguage } from '@/shared/i18n';

function categoryTopColor(category: string): string {
  switch (category) {
    case 'nms-packet':  return '#00c896';
    case 'nms-entity':  return '#58a6ff';
    case 'nms-bridge':  return '#e3b341';
    case 'nms-data':    return '#c084fc';
    case 'nms-ui':      return '#fb923c';
    case 'nms-display': return '#34d399';
    case 'nms-world':   return '#38bdf8';
    case 'nms-player':  return '#f472b6';
    default:            return '#3d5270';
  }
}

interface SkillCardProps {
  skill: SkillMeta;
}

export function SkillCard({ skill }: SkillCardProps) {
  const { lang } = useLanguage();
  const topColor = categoryTopColor(skill.category);
  const displayTitle = lang === 'en' ? skill.title : skill.titleZh;
  const displayDesc = lang === 'en' ? skill.description : skill.descriptionZh;

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group relative flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] transition-all duration-200 hover:border-[var(--color-border-strong)] card-glow focus-ring overflow-hidden"
    >
      {/* Category color top bar */}
      <div className="h-[2px] w-full shrink-0" style={{ backgroundColor: topColor }} />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Row 1: Title + CategoryIcon */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
              {displayTitle}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono truncate">
              {lang === 'en' ? skill.titleZh : skill.title}
            </p>
          </div>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-accent)] group-hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] transition-all"
          >
            <CategoryIcon category={skill.category} className="h-4 w-4" />
          </div>
        </div>

        {/* Row 2: Description (2-line clamp) */}
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {displayDesc}
        </p>

        {/* Row 3: Tags */}
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-[var(--color-border)] border border-[var(--color-border-strong)] px-2 py-0.5 text-[11px] text-[var(--color-text-secondary)] font-mono"
              >
                {tag}
              </span>
            ))}
            {skill.tags.length > 4 && (
              <span className="rounded bg-[var(--color-border)] border border-[var(--color-border-strong)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]">
                +{skill.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Bottom row: version + badge | date */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-text-muted)] font-mono">v{skill.version}</span>
            <SkillBadge status={skill.status} />
          </div>
          {skill.updatedAt && (
            <span className="text-[11px] text-[var(--color-border-strong)] group-hover:text-[var(--color-text-muted)] transition-colors">
              {formatDate(skill.updatedAt, lang === 'en' ? 'en-US' : 'zh-TW')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

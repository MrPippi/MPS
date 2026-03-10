import Link from 'next/link';
import type { SkillMeta } from '@/shared/types/skill';
import { SkillBadge } from './SkillBadge';
import { formatDate } from '@/shared/lib/utils';
import { CategoryIcon } from '@/features/categories';

interface SkillCardProps {
  skill: SkillMeta;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group relative flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 transition-all duration-200 hover:border-accent-dim card-hover focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-accent)] group-hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] transition-all">
            <CategoryIcon category={skill.category} className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
              {skill.titleZh}
            </h3>
            <p className="truncate text-xs text-[var(--color-text-muted)] mt-0.5">{skill.title}</p>
          </div>
        </div>
        <SkillBadge status={skill.status} />
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        {skill.descriptionZh}
      </p>

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

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">v{skill.version}</span>
          <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)]">
            {skill.categoryLabelEn}
          </span>
        </div>
        {skill.updatedAt && (
          <span className="text-[11px] text-[var(--color-border-strong)] group-hover:text-[var(--color-text-muted)] transition-colors">
            {formatDate(skill.updatedAt)}
          </span>
        )}
      </div>
    </Link>
  );
}

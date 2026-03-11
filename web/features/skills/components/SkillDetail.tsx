import Link from 'next/link';
import type { SkillFull } from '@/shared/types/skill';
import { SkillBadge } from './SkillBadge';
import { formatDate } from '@/shared/lib/utils';
import { GITHUB_REPO_URL } from '@/config/site';
import { CategoryIcon } from '@/features/categories';

interface SkillDetailProps {
  skill: SkillFull;
}

export function SkillDetail({ skill }: SkillDetailProps) {
  const githubUrl = skill.githubPath
    ? `${GITHUB_REPO_URL}/blob/main/${skill.githubPath}`
    : GITHUB_REPO_URL;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10 pb-8 border-b border-[var(--color-border)]">
        <div className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Link href="/skills" className="hover:text-[var(--color-accent)] transition-colors focus-ring rounded">
            Skills
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)]">{skill.titleZh}</span>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded border border-[var(--color-border-strong)] bg-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
            <CategoryIcon category={skill.category} className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <span>{skill.categoryLabelEn}</span>
          </div>
          <SkillBadge status={skill.status} />
        </div>

        <h1 className="text-4xl font-bold text-[var(--color-text)] leading-tight">{skill.titleZh}</h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)] font-mono">{skill.title}</p>

        <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)]">
          {skill.descriptionZh}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[var(--color-border-strong)] bg-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] font-mono"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">v{skill.version}</span>
            {skill.updatedAt && (
              <span>更新：{formatDate(skill.updatedAt)}</span>
            )}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded border border-[var(--color-border-strong)] bg-[var(--color-border)] px-3 py-1.5 text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-ring"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="skill-prose" dangerouslySetInnerHTML={{ __html: skill.contentHtml }} />
    </div>
  );
}

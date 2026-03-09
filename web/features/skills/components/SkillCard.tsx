import Link from 'next/link';
import type { SkillMeta } from '@/types/skill';
import { SkillBadge } from './SkillBadge';
import { formatDate } from '@/lib/utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface SkillCardProps {
  skill: SkillMeta;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group relative flex flex-col gap-4 rounded-lg border border-[#21262d] bg-[#161b22] p-5 transition-all duration-200 hover:border-[#3fb950]/40 card-hover"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] text-[#3fb950] group-hover:border-[#3fb950]/40 group-hover:bg-[#3fb950]/8 transition-all">
            <CategoryIcon category={skill.category} className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#e6edf3] group-hover:text-[#3fb950] transition-colors">
              {skill.titleZh}
            </h3>
            <p className="truncate text-xs text-[#484f58] mt-0.5">{skill.title}</p>
          </div>
        </div>
        <SkillBadge status={skill.status} />
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-xs leading-relaxed text-[#8b949e]">
        {skill.descriptionZh}
      </p>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#21262d] border border-[#30363d] px-2 py-0.5 text-[11px] text-[#8b949e] font-mono"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 4 && (
            <span className="rounded bg-[#21262d] border border-[#30363d] px-2 py-0.5 text-[11px] text-[#484f58]">
              +{skill.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#484f58] font-mono">v{skill.version}</span>
          <span className="rounded bg-[#21262d] px-1.5 py-0.5 text-[11px] text-[#484f58]">
            {skill.categoryLabelEn}
          </span>
        </div>
        {skill.updatedAt && (
          <span className="text-[11px] text-[#30363d] group-hover:text-[#484f58] transition-colors">
            {formatDate(skill.updatedAt)}
          </span>
        )}
      </div>
    </Link>
  );
}

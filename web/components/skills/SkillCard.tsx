import Link from 'next/link';
import type { SkillMeta } from '@/types/skill';
import { SkillBadge } from './SkillBadge';
import { formatDate } from '@/lib/utils';

interface SkillCardProps {
  skill: SkillMeta;
}

const CATEGORY_ICONS: Record<string, string> = {
  'api-integration': '⚡',
  scaffolding: '🏗️',
  configuration: '⚙️',
  commands: '💬',
  events: '📡',
  testing: '🧪',
  devops: '🚀',
  database: '🗄️',
  integrations: '🔌',
  general: '📦',
};

export function SkillCard({ skill }: SkillCardProps) {
  const icon = CATEGORY_ICONS[skill.category] ?? '📦';

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 transition-all duration-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none" role="img" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
              {skill.titleZh}
            </h3>
            <p className="truncate text-xs text-slate-500">{skill.title}</p>
          </div>
        </div>
        <SkillBadge status={skill.status} />
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
        {skill.descriptionZh}
      </p>

      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 4 && (
            <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-slate-500">
              +{skill.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
        <span className="text-xs text-slate-500">v{skill.version}</span>
        {skill.updatedAt && (
          <span className="text-xs text-slate-600">{formatDate(skill.updatedAt)}</span>
        )}
      </div>
    </Link>
  );
}

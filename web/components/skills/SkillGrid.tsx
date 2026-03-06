import type { SkillMeta } from '@/types/skill';
import { SkillCard } from './SkillCard';

interface SkillGridProps {
  skills: SkillMeta[];
  emptyMessage?: string;
}

export function SkillGrid({
  skills,
  emptyMessage = '目前沒有符合條件的 Skills',
}: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-[#30363d]">
        <div className="mb-3 text-[#30363d]">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-[#484f58]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}

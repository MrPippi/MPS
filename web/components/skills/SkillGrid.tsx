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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-slate-400">{emptyMessage}</p>
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

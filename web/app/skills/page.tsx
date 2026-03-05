import type { Metadata } from 'next';
import { getAllSkills, getCategories } from '@/lib/skills';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { Sidebar } from '@/components/layout/Sidebar';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: `所有 Skills | ${SITE_NAME}`,
  description: '瀏覽所有 Minecraft Plugin Skills，包含 API 調用、骨架生成、指令處理、事件監聽等各種開發工具。',
};

export default function SkillsPage() {
  const skills = getAllSkills();
  const categories = getCategories();

  const activeSkills = skills.filter((s) => s.status === 'active');
  const plannedSkills = skills.filter((s) => s.status === 'planned');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">所有 Skills</h1>
        <p className="mt-1 text-sm text-slate-500">
          共 {skills.length} 個 Skills · {activeSkills.length} 個已發布 · {plannedSkills.length} 個規劃中
        </p>
      </div>

      <div className="flex gap-10">
        <div className="hidden lg:block">
          <Sidebar categories={categories} />
        </div>

        <div className="flex-1 min-w-0">
          {activeSkills.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                已發布 ({activeSkills.length})
              </h2>
              <SkillGrid skills={activeSkills} />
            </section>
          )}

          {plannedSkills.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                規劃中 ({plannedSkills.length})
              </h2>
              <SkillGrid skills={plannedSkills} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

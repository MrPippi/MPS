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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[#21262d] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">Skills</p>
        <h1 className="text-3xl font-bold text-[#e6edf3]">所有 Skills</h1>
        <p className="mt-2 text-sm text-[#484f58]">
          共 {skills.length} 個 Skills · {activeSkills.length} 個已發布 · {plannedSkills.length} 個規劃中
        </p>
      </div>

      <div className="flex gap-10">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar categories={categories} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSkills.length > 0 && (
            <section className="mb-12">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3fb950] pulse-dot" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">
                    已發布
                  </h2>
                </div>
                <span className="rounded border border-[#30363d] bg-[#21262d] px-2 py-0.5 text-[11px] text-[#484f58]">
                  {activeSkills.length}
                </span>
              </div>
              <SkillGrid skills={activeSkills} />
            </section>
          )}

          {plannedSkills.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#484f58]" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">
                    規劃中
                  </h2>
                </div>
                <span className="rounded border border-[#30363d] bg-[#21262d] px-2 py-0.5 text-[11px] text-[#484f58]">
                  {plannedSkills.length}
                </span>
              </div>
              <SkillGrid skills={plannedSkills} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

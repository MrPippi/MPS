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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[#21262d] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">Skills</p>
        <h1 className="text-3xl font-bold text-[#e6edf3]">所有 Skills</h1>
        <p className="mt-2 text-sm text-[#484f58]">
          共 {skills.length} 個 Skills
        </p>
      </div>

      <div className="flex gap-10">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar categories={categories} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {skills.length > 0 && (
            <section className="mb-12">
              <SkillGrid skills={skills} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { getAllSkills, getCategories, SkillsPageClient } from '@/features/skills';
import { SITE_NAME } from '@/config/site';

export const metadata: Metadata = {
  title: `所有 Skills | ${SITE_NAME}`,
  description: '瀏覽所有 Minecraft NMS Claude Code Agent Skills，涵蓋封包發送、自定義實體 AI、反射式橋接、多版本 Adapter 等底層開發工具。',
};

export default function SkillsPage() {
  const skills = getAllSkills();
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">Skills</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">所有 Skills</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          共 {skills.length} 個 Skills
        </p>
      </div>

      <SkillsPageClient skills={skills} categories={categories} />
    </div>
  );
}

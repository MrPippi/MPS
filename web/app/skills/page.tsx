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

  return <SkillsPageClient skills={skills} categories={categories} />;
}

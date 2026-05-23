import type { Metadata } from 'next';
import { getCategories, getAllSkills } from '@/features/skills';
import { SITE_NAME } from '@/config/site';
import { CategoriesPageClient } from '@/features/categories/components/CategoriesPageClient';

export const metadata: Metadata = {
  title: `分類瀏覽 | ${SITE_NAME}`,
  description: '依分類瀏覽 Minecraft NMS Claude Code Agent Skills，包含封包發送、自定義實體 AI、反射式橋接等分類。',
};

export default function CategoriesPage() {
  const categories = getCategories();
  const allSkills = getAllSkills();

  const countsByCategory = allSkills.reduce<Record<string, { total: number; active: number }>>(
    (acc, skill) => {
      const entry = acc[skill.category] ?? { total: 0, active: 0 };
      return { ...acc, [skill.category]: { total: entry.total + 1, active: entry.active + (skill.status === 'active' ? 1 : 0) } };
    },
    {}
  );

  return (
    <CategoriesPageClient
      categories={categories}
      skillCount={allSkills.length}
      countsByCategory={countsByCategory}
    />
  );
}

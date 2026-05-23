import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories, getSkillsByCategory } from '@/features/skills';
import { SITE_NAME } from '@/config/site';
import { CategoryDetailClient } from '@/features/categories/components/CategoryDetailClient';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = getCategories();
  const cat = categories.find((c) => c.id === category);

  if (!cat) return { title: 'Category Not Found' };

  return {
    title: `${cat.label} | ${SITE_NAME}`,
    description: `瀏覽所有 ${cat.label}（${cat.labelEn}）分類的 Minecraft Plugin Skills。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const categories = getCategories();
  const cat = categories.find((c) => c.id === category);

  if (!cat) notFound();

  const skills = getSkillsByCategory(category);

  return (
    <CategoryDetailClient cat={cat!} skills={skills} categories={categories} />
  );
}

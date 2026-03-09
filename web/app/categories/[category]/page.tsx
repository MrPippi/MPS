import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories, getSkillsByCategory, SkillGrid } from '@/features/skills';
import { Sidebar } from '@/components/layout/Sidebar';
import { SITE_NAME } from '@/lib/utils';
import Link from 'next/link';

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[#21262d] pb-8">
        <div className="flex items-center gap-2 text-xs text-[#484f58] mb-4">
          <Link href="/categories" className="hover:text-[#3fb950] transition-colors">分類</Link>
          <span>/</span>
          <span className="text-[#8b949e]">{cat!.label}</span>
        </div>
        <h1 className="text-3xl font-bold text-[#e6edf3]">{cat!.label}</h1>
        <p className="mt-2 text-sm text-[#484f58]">
          {cat!.labelEn} · {skills.length} 個 Skills
        </p>
      </div>

      <div className="flex gap-10">
        <div className="hidden lg:block">
          <Sidebar categories={categories} activeCategory={category} />
        </div>
        <div className="flex-1 min-w-0">
          <SkillGrid skills={skills} emptyMessage="此分類目前沒有 Skills" />
        </div>
      </div>
    </div>
  );
}

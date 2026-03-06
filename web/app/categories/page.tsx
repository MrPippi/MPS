import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getAllSkills } from '@/lib/skills';
import { SITE_NAME } from '@/lib/utils';
import { CategoryIcon } from '@/components/icons/CategoryIcon';

export const metadata: Metadata = {
  title: `分類瀏覽 | ${SITE_NAME}`,
  description: '依分類瀏覽 Minecraft Plugin Skills，包含 API 整合、骨架生成、配置管理、指令系統等分類。',
};

export default function CategoriesPage() {
  const categories = getCategories();
  const allSkills = getAllSkills();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10 border-b border-[#21262d] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">分類</p>
        <h1 className="text-3xl font-bold text-[#e6edf3]">分類瀏覽</h1>
        <p className="mt-2 text-sm text-[#484f58]">
          共 {categories.length} 個分類 · {allSkills.length} 個 Skills
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const skills = allSkills.filter((s) => s.category === cat.id);
          const activeCount = skills.filter((s) => s.status === 'active').length;

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group flex items-start gap-4 rounded-lg border border-[#21262d] bg-[#161b22] p-6 transition-all hover:border-[#3fb950]/40 card-hover"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] text-[#3fb950] group-hover:border-[#3fb950]/40 group-hover:bg-[#3fb950]/8 transition-all">
                <CategoryIcon category={cat.id} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#3fb950] transition-colors">
                  {cat.label}
                </h2>
                <p className="text-xs text-[#484f58] mt-0.5">{cat.labelEn}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-[#8b949e]">{cat.count} 個 Skills</span>
                  {activeCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#3fb950]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] pulse-dot" />
                      {activeCount} 個已發布
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getAllSkills } from '@/lib/skills';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: `分類瀏覽 | ${SITE_NAME}`,
  description: '依分類瀏覽 Minecraft Plugin Skills，包含 API 整合、骨架生成、配置管理、指令系統等分類。',
};

const CATEGORY_ICONS: Record<string, string> = {
  'api-integration': '⚡',
  scaffolding: '🏗️',
  configuration: '⚙️',
  commands: '💬',
  events: '📡',
  testing: '🧪',
  devops: '🚀',
  database: '🗄️',
  integrations: '🔌',
  general: '📦',
};

export default function CategoriesPage() {
  const categories = getCategories();
  const allSkills = getAllSkills();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">分類瀏覽</h1>
        <p className="mt-1 text-sm text-slate-500">
          共 {categories.length} 個分類 · {allSkills.length} 個 Skills
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const icon = CATEGORY_ICONS[cat.id] ?? '📦';
          const skills = allSkills.filter((s) => s.category === cat.id);
          const activeCount = skills.filter((s) => s.status === 'active').length;

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 transition-all hover:border-emerald-500/40 hover:bg-slate-800/60"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl leading-none">{icon}</span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {cat.label}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">{cat.labelEn}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>{cat.count} 個 Skills</span>
                    {activeCount > 0 && (
                      <span className="text-emerald-500">{activeCount} 個已發布</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { getAllSkills, getFeaturedSkills, getCategories } from '@/lib/skills';
import { SkillCard } from '@/components/skills/SkillCard';
import { GITHUB_REPO_URL } from '@/lib/utils';

export default function HomePage() {
  const featuredSkills = getFeaturedSkills();
  const allSkills = getAllSkills();
  const categories = getCategories();
  const activeCount = allSkills.filter((s) => s.status === 'active').length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(34,197,94,0.05) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open Source · Cursor Agent Skills
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              Minecraft Plugin{' '}
              <span className="text-emerald-400">Skills</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              專為 Minecraft Java Edition 插件開發設計的 <strong className="text-slate-300">Cursor Agent Skills</strong> 函式庫。
              提供可復用的 AI 輔助開發技能，讓開發者快速自動化 Bukkit / Spigot / Paper 插件的常見開發任務。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                瀏覽所有 Skills
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-6">
            {[
              { value: allSkills.length, label: '個 Skills' },
              { value: activeCount, label: '個已發布' },
              { value: categories.length, label: '個分類' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">精選 Skills</h2>
              <p className="text-sm text-slate-500 mt-1">最常用、最完整的 Skills</p>
            </div>
            <Link href="/skills" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">依分類瀏覽</h2>
            <p className="text-sm text-slate-500 mt-1">快速找到你需要的開發工具</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="group rounded-xl border border-slate-700/60 bg-slate-800/30 p-4 transition-all hover:border-emerald-500/40 hover:bg-slate-800/60"
              >
                <div className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">
                  {cat.label}
                </div>
                <div className="mt-1 text-xs text-slate-600">{cat.labelEn}</div>
                <div className="mt-2 text-xs text-slate-500">{cat.count} 個 Skills</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-100 mb-2">想要貢獻新的 Skill？</h2>
          <p className="text-sm text-slate-400 mb-6">
            歡迎 Fork 本專案，按照規範新增 Skill 並送出 Pull Request。
          </p>
          <a
            href={`${GITHUB_REPO_URL}#貢獻指南`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            查看貢獻指南
          </a>
        </div>
      </section>
    </div>
  );
}

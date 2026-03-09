import Link from 'next/link';
import { getAllSkills, getFeaturedSkills, getCategories, SkillCard } from '@/features/skills';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { GITHUB_REPO_URL } from '@/lib/utils';

export default function HomePage() {
  const featuredSkills = getFeaturedSkills();
  const allSkills = getAllSkills();
  const categories = getCategories();
  const activeCount = allSkills.filter((s) => s.status === 'active').length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#21262d]">
        {/* Background elements */}
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="hero-glow absolute -top-40 -left-40 h-80 w-80 opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(63,185,80,0.4) 0%, transparent 70%)' }}
        />
        <div
          className="hero-glow absolute top-20 right-0 h-60 w-60 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(88,166,255,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3fb950]/20 bg-[#3fb950]/5 px-3 py-1 text-xs text-[#3fb950]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] pulse-dot" />
              Open Source · AI-powered · Cursor Agent Skills
            </div>

            {/* Title */}
            <h1 className="text-5xl font-extrabold tracking-tight text-[#e6edf3] sm:text-6xl lg:text-7xl leading-none">
              Minecraft
              <br />
              Plugin{' '}
              <span className="gradient-text">Studio</span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-[#8b949e] max-w-xl">
              一套基於 AI 的 Cursor Agent Skills 集合，協助開發者自動生成高品質的 Spigot / Paper 插件程式碼
              —— 從插件骨架到 CI/CD 工作流程。
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 rounded-md bg-[#3fb950] px-5 py-2.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#56d364] hover:shadow-lg hover:shadow-[#3fb950]/20"
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
                className="inline-flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-5 py-2.5 text-sm font-semibold text-[#c9d1d9] transition-all hover:border-[#8b949e] hover:bg-[#30363d]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center gap-8 border-t border-[#21262d] pt-8">
              {[
                { value: allSkills.length, label: '個 Skills' },
                { value: activeCount, label: '個已發布' },
                { value: categories.length, label: '個分類' },
              ].map((stat, i) => (
                <div key={stat.label} className={`flex items-baseline gap-2 ${i > 0 ? 'border-l border-[#21262d] pl-8' : ''}`}>
                  <span className="text-3xl font-bold tabular-nums text-[#3fb950]">{stat.value}</span>
                  <span className="text-xs text-[#484f58]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">精選</p>
              <h2 className="text-2xl font-bold text-[#e6edf3]">最常用的 Skills</h2>
              <p className="text-sm text-[#484f58] mt-1">最完整且使用率最高的工具集</p>
            </div>
            <Link
              href="/skills"
              className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#3fb950] transition-colors"
            >
              查看全部
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
      <section className="border-t border-[#21262d] bg-[#0d1117]/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">分類</p>
              <h2 className="text-2xl font-bold text-[#e6edf3]">依分類瀏覽</h2>
              <p className="text-sm text-[#484f58] mt-1">快速找到你需要的開發工具</p>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#3fb950] transition-colors"
            >
              查看全部
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="group flex flex-col gap-3 rounded-lg border border-[#21262d] bg-[#161b22] p-4 transition-all hover:border-[#3fb950]/40 hover:bg-[#161b22] card-hover"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#21262d] text-[#3fb950] group-hover:bg-[#3fb950]/10 transition-colors">
                  <CategoryIcon category={cat.id} className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#c9d1d9] group-hover:text-[#3fb950] transition-colors leading-tight">
                    {cat.label}
                  </div>
                  <div className="mt-0.5 text-xs text-[#484f58]">{cat.labelEn}</div>
                </div>
                <div className="text-xs text-[#30363d] group-hover:text-[#484f58] transition-colors">
                  {cat.count} 個
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-[#3fb950]/20 bg-[#0d1117] p-10">
          <div
            className="hero-glow absolute -top-20 -right-20 h-40 w-40 opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(63,185,80,0.5) 0%, transparent 70%)' }}
          />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-[#e6edf3] mb-2">想要貢獻新的 Skill？</h2>
              <p className="text-sm text-[#8b949e] max-w-md">
                歡迎 Fork 本專案，按照規範新增 Skill 並送出 Pull Request。社群的力量讓工具更完整。
              </p>
            </div>
            <a
              href={`${GITHUB_REPO_URL}#貢獻指南`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-md border border-[#3fb950]/40 bg-[#3fb950]/10 px-5 py-2.5 text-sm font-semibold text-[#3fb950] transition-all hover:bg-[#3fb950]/20 hover:border-[#3fb950]/60"
            >
              查看貢獻指南
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

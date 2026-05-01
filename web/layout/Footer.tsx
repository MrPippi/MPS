import Link from 'next/link';
import { GITHUB_REPO_URL, GITHUB_CONTRIBUTE_URL, SITE_NAME } from '@/config/site';
import { PickaxeIcon } from '@/shared/ui';

const GITHUB_SVG = (
  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface)]">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-strong)] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {/* Left: Brand + description + GitHub button */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] border border-accent-soft">
                <PickaxeIcon className="h-4 w-4 text-[var(--color-accent)]" />
              </div>
              <span className="text-sm font-extrabold text-[var(--color-text)]">MJP-Claude-Skills</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-xs">
              Paper 1.21.x NMS 底層開發的 Claude Code Agent Skills 函式庫，基於 Paperweight + Mojang mappings。
            </p>
            <div className="mt-5">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]"
              >
                {GITHUB_SVG}
                GitHub
              </a>
            </div>
          </div>

          {/* Right: Nav + Resources two-column */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">導覽</h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/', label: '首頁' },
                  { href: '/skills', label: '所有 Skills' },
                  { href: '/categories', label: '分類瀏覽' },
                  { href: '/guide', label: '使用方法' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] rounded"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">資源</h3>
              <ul className="space-y-2.5">
                {[
                  { href: GITHUB_REPO_URL, label: 'GitHub 專案' },
                  { href: GITHUB_CONTRIBUTE_URL, label: '貢獻指南' },
                  { href: `${GITHUB_REPO_URL}/blob/main/LICENSE`, label: '授權條款' },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] rounded"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <p>© {new Date().getFullYear()} {SITE_NAME}. Open Source under MIT.</p>
          <p className="flex items-center gap-1.5">
            Built with <span className="text-[var(--color-accent)]">Claude Code Agent Skills</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

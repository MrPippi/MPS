'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { GITHUB_REPO_URL } from '@/config/site';
import { PickaxeIcon } from '@/shared/ui';

const NAV_LINKS = [
  { href: '/skills', label: 'Skills' },
  { href: '/categories', label: '分類' },
  { href: '/guide', label: '使用方法' },
];

interface HeaderProps {
  onSearchOpen?: () => void;
}

export function Header({ onSearchOpen }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_95%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 focus-ring rounded-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] border border-accent-soft group-hover:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] transition-colors">
            <PickaxeIcon className="h-4 w-4 text-[var(--color-accent)]" />
          </div>
          <div className="hidden sm:flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[var(--color-text)] tracking-tight">MPS</span>
            <span className="text-xs text-[var(--color-text-muted)] font-normal">Minecraft Plugin Studio</span>
          </div>
          <span className="block sm:hidden text-sm font-bold text-[var(--color-text)]">MPS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-ring ${
                pathname.startsWith(link.href)
                  ? 'text-[var(--color-accent)] bg-accent-subtle'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              {pathname.startsWith(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[var(--color-accent)]" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onSearchOpen}
            className="group flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-ring"
            aria-label="搜尋 Skills"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:block">搜尋 Skills...</span>
            <kbd className="hidden sm:inline-flex items-center rounded bg-[var(--color-border)] border border-[var(--color-border-strong)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)] font-mono">
              ⌘K
            </kbd>
          </button>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-border)] text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border-strong)] focus-ring"
            aria-label="GitHub"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
            </svg>
          </a>

          {/* Mobile menu toggle */}
          <button
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors focus-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="選單"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-inset ${
                pathname.startsWith(link.href)
                  ? 'bg-accent-subtle text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

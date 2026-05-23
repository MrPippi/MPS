'use client';

import Link from 'next/link';
import { PickaxeIcon } from '@/shared/ui';
import { useLanguage } from '@/shared/i18n';

export function NotFoundClient() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-accent)]">
        <PickaxeIcon className="h-8 w-8" />
      </div>
      <div className="text-6xl font-extrabold text-[var(--color-border)] mb-3 tabular-nums">404</div>
      <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">{t.notFound.title}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-sm">
        {t.notFound.description}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] focus-ring"
      >
        {t.notFound.backHome}
      </Link>
    </div>
  );
}

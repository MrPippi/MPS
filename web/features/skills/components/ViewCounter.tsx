'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/views/${slug}`, { method: 'POST' })
      .then((r) => r.json())
      .then((data: { views: number }) => setViews(data.views))
      .catch(() => setViews(null));
  }, [slug]);

  if (views === null) return null;

  return (
    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      <span className="tabular-nums">{views.toLocaleString()}</span>
    </span>
  );
}

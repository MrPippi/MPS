'use client';

import { statusColor } from '@/shared/lib/utils';
import type { SkillStatus } from '@/shared/types/skill';
import { useLanguage } from '@/shared/i18n';

interface SkillBadgeProps {
  status: SkillStatus;
  className?: string;
}

export function SkillBadge({ status, className = '' }: SkillBadgeProps) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium ${statusColor(status)} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'active' ? 'bg-[var(--color-accent)] pulse-dot' : 'bg-[var(--color-error)]'
        }`}
      />
      {t.status[status]}
    </span>
  );
}

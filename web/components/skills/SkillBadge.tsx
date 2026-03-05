import { statusColor, statusLabel } from '@/lib/utils';
import type { SkillStatus } from '@/types/skill';

interface SkillBadgeProps {
  status: SkillStatus;
  className?: string;
}

export function SkillBadge({ status, className = '' }: SkillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(status)} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'active'
            ? 'bg-emerald-400'
            : status === 'deprecated'
              ? 'bg-red-400'
              : 'bg-slate-500'
        }`}
      />
      {statusLabel(status)}
    </span>
  );
}

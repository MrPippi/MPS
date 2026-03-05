import type { SkillStatus } from '@/types/skill';

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function statusColor(status: SkillStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'planned':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'deprecated':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function statusLabel(status: SkillStatus): string {
  switch (status) {
    case 'active':
      return '已發布';
    case 'planned':
      return '規劃中';
    case 'deprecated':
      return '已棄用';
    default:
      return status;
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const GITHUB_REPO_URL = 'https://github.com/MrPippi/MPS';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mps.vercel.app';
export const SITE_NAME = 'MPS — Minecraft Plugin Studio';
export const SITE_DESCRIPTION =
  'AI-powered development toolkit for Spigot / Paper plugins. A collection of Cursor Agent Skills that help developers generate high-quality Minecraft plugin code automatically.';

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
      return 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/25';
    case 'deprecated':
      return 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/25';
  }
}

export function statusLabel(status: SkillStatus): string {
  switch (status) {
    case 'active':
      return '已發布';
    case 'deprecated':
      return '已棄用';
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

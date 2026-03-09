'use client';

import Fuse from 'fuse.js';
import type { SearchIndex } from '@/types/skill';

let fuseInstance: Fuse<SearchIndex> | null = null;

export function createSearchIndex(data: SearchIndex[]): Fuse<SearchIndex> {
  fuseInstance = new Fuse(data, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'titleZh', weight: 3 },
      { name: 'description', weight: 2 },
      { name: 'descriptionZh', weight: 2 },
      { name: 'tags', weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 1,
  });
  return fuseInstance;
}

export function search(query: string, fuse: Fuse<SearchIndex>) {
  if (!query.trim()) return [];
  return fuse.search(query).slice(0, 10);
}

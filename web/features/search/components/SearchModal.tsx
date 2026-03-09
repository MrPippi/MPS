'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Fuse, { type FuseResult } from 'fuse.js';
import { createSearchIndex, search } from '@/features/search/api/search';
import type { SearchIndex } from '@/types/skill';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchData: SearchIndex[];
}

const STATUS_LABELS: Record<string, string> = {
  active: '已發布',
  deprecated: '已棄用',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-[#3fb950]',
  deprecated: 'text-[#f85149]',
};

export function SearchModal({ isOpen, onClose, searchData }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<SearchIndex>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<SearchIndex> | null>(null);

  useEffect(() => {
    if (searchData.length > 0) {
      fuseRef.current = createSearchIndex(searchData);
    }
  }, [searchData]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(0);
      if (fuseRef.current) {
        setResults(search(value, fuseRef.current));
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        onClose();
        window.location.href = `/skills/${results[selectedIndex].item.slug}`;
      }
    },
    [results, selectedIndex, onClose]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-md" />

      <div
        className="relative w-full max-w-xl rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[#21262d] px-4 py-3.5">
          <svg className="h-4 w-4 shrink-0 text-[#484f58]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋 Skills..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-[#e6edf3] placeholder-[#484f58] outline-none"
          />
          <button
            onClick={onClose}
            className="shrink-0 rounded border border-[#30363d] bg-[#21262d] px-2 py-0.5 text-xs text-[#484f58] hover:text-[#8b949e] transition-colors font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {query === '' && (
            <div className="py-12 text-center text-sm text-[#30363d]">
              輸入關鍵字搜尋 Skills、標籤或分類...
            </div>
          )}

          {query !== '' && results.length === 0 && (
            <div className="py-12 text-center text-sm text-[#30363d]">
              找不到「{query}」相關的 Skill
            </div>
          )}

          {results.length > 0 && (
            <ul className="p-1.5">
              {results.map((result, index) => (
                <li key={result.item.id}>
                  <Link
                    href={`/skills/${result.item.slug}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-all ${
                      index === selectedIndex
                        ? 'bg-[#3fb950]/8 border border-[#3fb950]/20'
                        : 'text-[#c9d1d9] hover:bg-[#21262d] border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-[#e6edf3]">{result.item.titleZh}</span>
                        <span className={`text-[11px] shrink-0 ${STATUS_COLORS[result.item.status]}`}>
                          {STATUS_LABELS[result.item.status]}
                        </span>
                      </div>
                      <p className="truncate text-xs text-[#484f58] mt-0.5">
                        {result.item.descriptionZh}
                      </p>
                    </div>
                    <svg className="h-3.5 w-3.5 shrink-0 text-[#30363d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-[#21262d] px-4 py-2.5 text-[11px] text-[#30363d]">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-[#30363d] bg-[#21262d] px-1.5 py-0.5 font-mono">↑↓</kbd>
            導覽
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-[#30363d] bg-[#21262d] px-1.5 py-0.5 font-mono">↵</kbd>
            開啟
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-[#30363d] bg-[#21262d] px-1.5 py-0.5 font-mono">ESC</kbd>
            關閉
          </span>
        </div>
      </div>
    </div>
  );
}

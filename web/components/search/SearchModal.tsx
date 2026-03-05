'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Fuse, { type FuseResult } from 'fuse.js';
import { createSearchIndex, search } from '@/lib/search';
import type { SearchIndex } from '@/types/skill';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchData: SearchIndex[];
}

const STATUS_LABELS: Record<string, string> = {
  active: '已發布',
  planned: '規劃中',
  deprecated: '已棄用',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400',
  planned: 'text-slate-500',
  deprecated: 'text-red-400',
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
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-700/50 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋 Skills..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-700 px-2 py-0.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ESC
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query === '' && (
            <div className="py-10 text-center text-sm text-slate-600">
              輸入關鍵字搜尋 Skills、標籤或分類...
            </div>
          )}

          {query !== '' && results.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-600">
              找不到「{query}」相關的 Skill
            </div>
          )}

          {results.length > 0 && (
            <ul className="p-2">
              {results.map((result, index) => (
                <li key={result.item.id}>
                  <Link
                    href={`/skills/${result.item.slug}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                      index === selectedIndex
                        ? 'bg-emerald-500/10 text-slate-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.item.titleZh}</span>
                        <span className={`text-xs shrink-0 ${STATUS_COLORS[result.item.status]}`}>
                          {STATUS_LABELS[result.item.status]}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500 mt-0.5">
                        {result.item.descriptionZh}
                      </p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-700/50 px-4 py-2 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-700 px-1">↑↓</kbd> 導覽
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-700 px-1">↵</kbd> 開啟
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-slate-700 px-1">ESC</kbd> 關閉
          </span>
        </div>
      </div>
    </div>
  );
}

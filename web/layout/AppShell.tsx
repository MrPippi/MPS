'use client';

import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchModal } from '@/features/search';
import type { SearchIndex } from '@/shared/types/skill';

interface AppShellProps {
  children: React.ReactNode;
  searchData: SearchIndex[];
}

export function AppShell({ children, searchData }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchData={searchData}
      />
    </div>
  );
}

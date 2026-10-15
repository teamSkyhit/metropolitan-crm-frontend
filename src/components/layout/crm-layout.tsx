'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils/cn';

interface CrmLayoutProps {
  children: ReactNode;
}

export function CrmLayout({ children }: CrmLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f4f7fb]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-out md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          onNavigate={() => setIsMobileMenuOpen(false)}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] min-[380px]:px-4 sm:px-6 sm:py-5 md:px-8 md:py-7 xl:px-10">
          <div className="mx-auto h-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

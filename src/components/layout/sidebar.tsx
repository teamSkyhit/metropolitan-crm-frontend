'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/features/auth/auth.store';
import { canAccessRoute } from '@/features/auth/permissions';

import { NAVIGATION_CONFIG } from '@/config/navigation';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  onClose?: () => void;
}

export function Sidebar({ className, onNavigate, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useAuthStore();

  // Filter items based on user role
  const visibleNavItems = NAVIGATION_CONFIG.filter((item) => canAccessRoute(role, item.href));

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <aside
      id={onClose ? 'mobile-navigation' : undefined}
      aria-label="Main navigation"
      className={cn(
        'relative flex h-full w-[280px] shrink-0 flex-col overflow-hidden bg-[var(--color-metro-navy)] text-white',
        className
      )}
    >
      <div className="relative flex h-[82px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 items-center justify-center rounded-xl bg-white px-3 py-1 shadow-md shadow-black/20 ring-1 ring-white/20">
            <Image
              src="/logo.png"
              alt="Metropolitan Logo"
              width={160}
              height={42}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-white/65 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="px-5 pb-2 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Workspace</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Sidebar Navigation">
        <ul className="space-y-1.5">
          {visibleNavItems.map((item) => {
            const safePathname = pathname || '';
            const isActive = safePathname === item.href || safePathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)]',
                    isActive
                      ? 'bg-white text-[#0a2342] font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.2)]'
                      : 'text-white/70 hover:bg-white/[0.08] hover:text-white font-medium'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-105',
                      isActive ? 'text-[#b98708]' : 'text-white/60 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 tracking-tight">{item.name}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d6a628] shadow-[0_0_8px_#d6a628]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/65 transition-colors outline-none hover:bg-red-400/10 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)]"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

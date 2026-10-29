'use client';

import { Menu, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/auth.store';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { NAVIGATION_CONFIG } from '@/config/navigation';
import { canAccessRoute } from '@/features/auth/permissions';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({ onMenuClick, isMobileMenuOpen = false }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.LOGIN);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const currentPage = NAVIGATION_CONFIG.find((item) => {
    const safePathname = pathname || '';
    return safePathname === item.href || safePathname.startsWith(item.href + '/');
  });
  const pageTitle = currentPage ? currentPage.name : 'Metro Industrial CRM';

  // Subpage title determination for breadcrumb
  let subpageTitle = '';
  if (pathname?.endsWith('/new')) {
    const rawName = currentPage?.name || 'Item';
    const singularName = rawName.endsWith('ies')
      ? rawName.slice(0, -3) + 'y'
      : rawName.replace(/s$/, '');
    subpageTitle = `New ${singularName}`;
  } else if (pathname?.split('/').length > 2 && !pathname?.endsWith('/new')) {
    subpageTitle = 'Details';
  }

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  return (
    <header className="relative z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-[#e5eaf1] bg-white/95 px-4 backdrop-blur sm:px-6 md:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Open sidebar menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-slate-400 sm:flex">
            <span>Workspace</span>
            <span>/</span>
            <span
              className={
                subpageTitle ? 'text-slate-500' : 'text-[var(--color-metro-navy)] font-bold'
              }
            >
              {pageTitle}
            </span>
            {subpageTitle && (
              <>
                <span>/</span>
                <span className="text-[var(--color-metro-navy)] font-bold">{subpageTitle}</span>
              </>
            )}
          </div>
          <h1 className="max-w-[180px] truncate text-lg font-bold tracking-[-0.02em] text-[#17263b] sm:max-w-xs md:max-w-md">
            {subpageTitle || pageTitle}
          </h1>
        </div>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-3">
        {canAccessRoute(user?.role, ROUTES.NOTIFICATIONS) && (
          <Link
            href={ROUTES.NOTIFICATIONS}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-transparent text-gray-500 transition-colors hover:border-gray-200 hover:bg-gray-50 hover:text-[#102f57] focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-gold)]"
            aria-label={`View notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-colors hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-gold)] sm:pr-2.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-metro-navy)] text-sm font-bold text-white shadow-sm ring-2 ring-[#d6a628]/20">
              {userInitial}
            </div>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-700 leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-gray-500 leading-tight">
                {user?.role?.replace('_', ' ') || 'Role'}
              </span>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1.5 shadow-[0_18px_45px_rgba(15,38,68,0.16)]">
              <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs font-semibold text-[var(--color-metro-navy)] mt-1">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              {canAccessRoute(user?.role, ROUTES.SETTINGS) && (
                <Link
                  href={ROUTES.SETTINGS}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors border-b border-gray-100"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

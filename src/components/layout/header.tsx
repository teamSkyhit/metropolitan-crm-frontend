'use client';

import { Menu, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/auth.store';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { NAVIGATION_CONFIG } from '@/config/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Open sidebar menu"
          aria-expanded="false"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4 relative">
        <Link
          href="/notifications"
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-gold)]"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 hover:bg-gray-100 p-1 pr-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-metro-gold)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-metro-navy)] text-white flex items-center justify-center font-bold text-sm">
              {userInitial}
            </div>
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
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs font-semibold text-[var(--color-metro-navy)] mt-1">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
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

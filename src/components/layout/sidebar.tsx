'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/features/auth/auth.store';
import { canAccessRoute } from '@/features/auth/permissions';

import { NAVIGATION_CONFIG } from '@/config/navigation';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
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
      className={cn(
        'flex flex-col w-64 h-screen bg-[var(--color-metro-navy)] text-white border-r border-gray-800',
        className
      )}
    >
      <div className="flex items-center justify-center h-16 bg-white border-b border-gray-200 px-4 shrink-0">
        <Image
          src="/logo.png"
          alt="Metro Logo"
          width={150}
          height={40}
          className="h-10 w-auto"
          priority
        />
      </div>
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Sidebar Navigation">
        <ul className="space-y-1 px-3">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)]',
                    isActive
                      ? 'bg-[var(--color-metro-gold)] text-[var(--color-metro-navy)] font-bold'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)]"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

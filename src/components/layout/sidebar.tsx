'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { Home, Users, Settings, Package, Inbox, Layers, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/features/auth/auth.store';
import { canAccessRoute } from '@/features/auth/permissions';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: Home },
    { name: 'Enquiries', href: ROUTES.ENQUIRIES, icon: Inbox },
    { name: 'Products', href: ROUTES.PRODUCTS, icon: Package },
    { name: 'Categories', href: ROUTES.CATEGORIES, icon: Layers },
    { name: 'Users', href: ROUTES.USERS, icon: Users },
    { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  ];

  // Filter items based on user role
  const visibleNavItems = navItems.filter((item) => canAccessRoute(role, item.href));

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
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
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-[var(--color-metro-gold)] text-[var(--color-metro-navy)] font-bold'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

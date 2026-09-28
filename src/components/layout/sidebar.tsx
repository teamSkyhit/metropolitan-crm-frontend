import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Home, Users, Settings, Package, Inbox, Layers } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navItems = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: Home },
    { name: 'Enquiries', href: ROUTES.ENQUIRIES, icon: Inbox },
    { name: 'Products', href: ROUTES.PRODUCTS, icon: Package },
    { name: 'Categories', href: ROUTES.CATEGORIES, icon: Layers },
    { name: 'Users', href: ROUTES.USERS, icon: Users },
    { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col w-64 h-screen bg-gray-900 text-white border-r border-gray-800',
        className
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className="text-lg font-bold">Metro CRM</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

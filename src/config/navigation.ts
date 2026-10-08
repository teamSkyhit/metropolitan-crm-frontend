import { ROUTES } from '@/lib/constants/routes';
import { Home, Users, Settings, Package, Inbox, Layers, Tag, Layout, Contact } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const NAVIGATION_CONFIG: NavItem[] = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: Home },
  { name: 'Enquiries', href: ROUTES.ENQUIRIES, icon: Inbox },
  { name: 'Products', href: ROUTES.PRODUCTS, icon: Package },
  { name: 'Categories', href: ROUTES.CATEGORIES, icon: Layers },
  { name: 'Brands', href: ROUTES.BRANDS, icon: Tag },
  { name: 'Homepage CMS', href: ROUTES.HOMEPAGE, icon: Layout },
  { name: 'Users', href: ROUTES.USERS, icon: Users },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

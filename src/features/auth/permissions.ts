import { Role } from '@/types/auth';
import { ROLES } from '@/lib/constants/roles';

export function hasRole(userRole: Role | undefined | null, expectedRole: Role): boolean {
  return userRole === expectedRole;
}

export function hasAnyRole(userRole: Role | undefined | null, expectedRoles: Role[]): boolean {
  if (!userRole) return false;
  return expectedRoles.includes(userRole);
}

// Super admin has access to everything by default.
// Sales Manager has restricted access.
export function canAccessRoute(userRole: Role | undefined | null, route: string): boolean {
  if (!userRole) return false;
  if (userRole === ROLES.SUPER_ADMIN) return true;

  // Sales Manager restricted routes
  const restrictedForSalesManager = ['/users', '/settings'];

  if (userRole === ROLES.SALES_MANAGER) {
    return !restrictedForSalesManager.some((r) => route.startsWith(r));
  }

  return false;
}

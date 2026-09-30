import { Role } from '@/types/auth';
import { ROLES } from '@/lib/constants/roles';
import { ROUTES } from '@/lib/constants/routes';

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
  const restrictedForSalesManager = [ROUTES.USERS, ROUTES.SETTINGS];

  if (userRole === ROLES.SALES_MANAGER) {
    return !restrictedForSalesManager.some((r) => route.startsWith(r));
  }

  return false;
}

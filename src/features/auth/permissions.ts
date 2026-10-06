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

export type Permission =
  | 'enquiries:update'
  | 'enquiries:assign'
  | 'enquiries:follow-up'
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'homepage:read'
  | 'homepage:create'
  | 'homepage:update'
  | 'homepage:delete';

export function hasPermission(
  user: { role: Role } | undefined | null,
  permission: Permission
): boolean {
  if (!user || !user.role) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  if (user.role === ROLES.SALES_MANAGER) {
    // Sales Managers can do these actions
    const allowed = [
      'enquiries:update',
      'enquiries:follow-up',
      'enquiries:assign',
      'products:read',
      'products:create',
      'products:update',
      'products:delete',
    ];
    if (allowed.includes(permission)) return true;
  }

  return false;
}

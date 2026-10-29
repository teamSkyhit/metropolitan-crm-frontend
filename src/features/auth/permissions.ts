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

// Super admin has access to all CRM modules explicitly.
// CRM_USER has access only to Enquiries.
export function canAccessRoute(userRole: Role | undefined | null, route: string): boolean {
  if (!userRole) return false;

  const allowedForCrmUser = [ROUTES.ENQUIRIES];

  const allowedForSuperAdmin = [
    ROUTES.DASHBOARD,
    ROUTES.ENQUIRIES,
    ROUTES.PRODUCTS,
    ROUTES.CATEGORIES,
    ROUTES.BRANDS,
    ROUTES.INDUSTRIAL_CAPABILITIES,
    ROUTES.NOTIFICATIONS,
    ROUTES.SETTINGS,
    ROUTES.USERS,
    ROUTES.HOMEPAGE,
  ];

  const allowedRoutes = userRole === ROLES.SUPER_ADMIN ? allowedForSuperAdmin : allowedForCrmUser;

  return allowedRoutes.some((r) => route === r || route.startsWith(r + '/'));
}

export type Permission =
  | 'enquiries:read'
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
  | 'homepage:delete'
  | 'industrial-capabilities:read'
  | 'industrial-capabilities:create'
  | 'industrial-capabilities:update'
  | 'industrial-capabilities:delete';

export function hasPermission(
  user: { role: Role } | undefined | null,
  permission: Permission
): boolean {
  if (!user || !user.role) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  // CRM_USER only has permissions on enquiries (excluding assign)
  const allowedForCrmUser: Permission[] = [
    'enquiries:read',
    'enquiries:update',
    'enquiries:follow-up',
  ];

  return allowedForCrmUser.includes(permission);
}

import { expect, test } from 'vitest';
import { canAccessRoute, hasPermission } from './permissions';
import { ROLES } from '@/lib/constants/roles';
import { ROUTES } from '@/lib/constants/routes';

test('canAccessRoute explicitly allows admin to dashboard', () => {
  expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.DASHBOARD)).toBe(true);
});

test('canAccessRoute blocks unauthenticated', () => {
  expect(canAccessRoute(null, ROUTES.DASHBOARD)).toBe(false);
});

test('canAccessRoute explicit list for sales manager', () => {
  expect(canAccessRoute(ROLES.SALES_MANAGER, ROUTES.DASHBOARD)).toBe(true);
  expect(canAccessRoute(ROLES.SALES_MANAGER, ROUTES.USERS)).toBe(false);
  expect(canAccessRoute(ROLES.SALES_MANAGER, ROUTES.SETTINGS)).toBe(false);
});

test('hasPermission logic', () => {
  expect(hasPermission({ role: ROLES.SUPER_ADMIN }, 'enquiries:assign')).toBe(true);
  expect(hasPermission({ role: ROLES.SALES_MANAGER }, 'enquiries:assign')).toBe(true);
  expect(hasPermission({ role: ROLES.SALES_MANAGER }, 'homepage:update')).toBe(false);
});

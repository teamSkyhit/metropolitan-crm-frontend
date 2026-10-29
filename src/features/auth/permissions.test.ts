import { expect, test, describe } from 'vitest';
import { canAccessRoute, hasPermission } from './permissions';
import { ROLES } from '@/lib/constants/roles';
import { ROUTES } from '@/lib/constants/routes';
import { NAVIGATION_CONFIG } from '@/config/navigation';

describe('Role-based route access (canAccessRoute)', () => {
  test('SUPER_ADMIN: full access to all operational & admin modules', () => {
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.DASHBOARD)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.ENQUIRIES)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.PRODUCTS)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.CATEGORIES)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.BRANDS)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.INDUSTRIAL_CAPABILITIES)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.HOMEPAGE)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.USERS)).toBe(true);
    expect(canAccessRoute(ROLES.SUPER_ADMIN, ROUTES.SETTINGS)).toBe(true);
  });

  test('CRM_USER: restricted strictly and exclusively to enquiries module', () => {
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.ENQUIRIES)).toBe(true);
    expect(canAccessRoute(ROLES.CRM_USER, `${ROUTES.ENQUIRIES}/any-id-123`)).toBe(true);
    // Explicitly forbidden modules:
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.DASHBOARD)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.PRODUCTS)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.CATEGORIES)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.BRANDS)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.USERS)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.HOMEPAGE)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.INDUSTRIAL_CAPABILITIES)).toBe(false);
    expect(canAccessRoute(ROLES.CRM_USER, ROUTES.SETTINGS)).toBe(false);
  });

  test('Unauthenticated user has no access', () => {
    expect(canAccessRoute(null, ROUTES.DASHBOARD)).toBe(false);
    expect(canAccessRoute(null, ROUTES.ENQUIRIES)).toBe(false);
  });
});

describe('Sidebar navigation item visibility across roles', () => {
  test('SUPER_ADMIN visible navigation items include all modules', () => {
    const visible = NAVIGATION_CONFIG.filter((item) =>
      canAccessRoute(ROLES.SUPER_ADMIN, item.href)
    );
    const names = visible.map((i) => i.name);
    expect(names).toContain('Dashboard');
    expect(names).toContain('Enquiries');
    expect(names).toContain('Products');
    expect(names).toContain('Categories');
    expect(names).toContain('Brands');
    expect(names).toContain('Industrial Capabilities');
    expect(names).toContain('Homepage CMS');
    expect(names).toContain('Users');
    expect(names).toContain('Settings');
  });

  test('CRM_USER visible navigation items ONLY include Enquiries', () => {
    const visible = NAVIGATION_CONFIG.filter((item) => canAccessRoute(ROLES.CRM_USER, item.href));
    const names = visible.map((i) => i.name);
    expect(names).toEqual(['Enquiries']);
  });
});

describe('Action permissions (hasPermission)', () => {
  test('SUPER_ADMIN has all action permissions', () => {
    expect(hasPermission({ role: ROLES.SUPER_ADMIN }, 'enquiries:assign')).toBe(true);
    expect(hasPermission({ role: ROLES.SUPER_ADMIN }, 'industrial-capabilities:create')).toBe(true);
    expect(hasPermission({ role: ROLES.SUPER_ADMIN }, 'homepage:update')).toBe(true);
  });

  test('CRM_USER has read/update/follow-up on enquiries, but strictly no assignment', () => {
    expect(hasPermission({ role: ROLES.CRM_USER }, 'enquiries:read')).toBe(true);
    expect(hasPermission({ role: ROLES.CRM_USER }, 'enquiries:update')).toBe(true);
    expect(hasPermission({ role: ROLES.CRM_USER }, 'enquiries:follow-up')).toBe(true);
    expect(hasPermission({ role: ROLES.CRM_USER }, 'enquiries:assign')).toBe(false);
    expect(hasPermission({ role: ROLES.CRM_USER }, 'homepage:update')).toBe(false);
    expect(hasPermission({ role: ROLES.CRM_USER }, 'products:create')).toBe(false);
    expect(hasPermission({ role: ROLES.CRM_USER }, 'industrial-capabilities:create')).toBe(false);
  });
});

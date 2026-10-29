/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersService } from './users.service';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches users list with search and role params', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [
          { id: 'u1', name: 'Admin', email: 'admin@example.com', role: 'SUPER_ADMIN' },
          { id: 'u2', name: 'CRM Rep', email: 'crm@example.com', role: 'CRM_USER' },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockResponse as any);

    const result = await usersService.getUsers({ search: 'Rep', role: 'CRM_USER' });

    expect(apiClient.get).toHaveBeenCalledWith('/users', {
      params: { search: 'Rep', role: 'CRM_USER' },
    });
    expect(result.data).toHaveLength(2);
  });

  it('creates a new user with CRM_USER role', async () => {
    const payload = {
      name: 'Agent Smith',
      email: 'smith@example.com',
      password: 'Password123!',
      role: 'CRM_USER' as const,
    };

    const mockCreated = {
      id: 'new-crm-user-id',
      name: payload.name,
      email: payload.email,
      role: 'CRM_USER',
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: null,
      createdAt: '2026-10-29T10:00:00.000Z',
      updatedAt: '2026-10-29T10:00:00.000Z',
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, data: mockCreated },
    } as any);

    const result = await usersService.createUser(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/users', payload);
    expect(result.data.role).toBe('CRM_USER');
    expect(result.data.id).toBe('new-crm-user-id');
  });

  it('creates a new user with CRM_USER role', async () => {
    const payload = {
      name: 'Manager Bob',
      email: 'bob@example.com',
      password: 'Password123!',
      role: 'CRM_USER' as const,
    };

    const mockCreated = {
      id: 'new-crm-user-id',
      name: payload.name,
      email: payload.email,
      role: 'CRM_USER',
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: null,
      createdAt: '2026-10-29T10:00:00.000Z',
      updatedAt: '2026-10-29T10:00:00.000Z',
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, data: mockCreated },
    } as any);

    const result = await usersService.createUser(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/users', payload);
    expect(result.data.role).toBe('CRM_USER');
  });

  it('updates user contact details', async () => {
    const updatePayload = { name: 'Updated Name', email: 'updated@example.com' };
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { success: true, data: { id: 'u1', ...updatePayload, role: 'CRM_USER' } },
    } as any);

    const result = await usersService.updateUser('u1', updatePayload);

    expect(apiClient.patch).toHaveBeenCalledWith('/users/u1', updatePayload);
    expect(result.data.name).toBe('Updated Name');
  });

  it('toggles user active status', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { success: true, data: { id: 'u1', isActive: false } },
    } as any);

    const result = await usersService.setUserStatus('u1', { isActive: false });

    expect(apiClient.patch).toHaveBeenCalledWith('/users/u1/status', { isActive: false });
    expect(result.data.isActive).toBe(false);
  });

  it('deletes user', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as any);

    await usersService.deleteUser('u1');

    expect(apiClient.delete).toHaveBeenCalledWith('/users/u1');
  });
});

import { apiClient } from '@/lib/api/client';
import {
  User,
  UserLookup,
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  SetUserStatusRequest,
  ResetUserPasswordRequest,
} from '@/features/users/types';
import { Role } from '@/types/auth';

export const usersService = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    isActive?: 'true' | 'false';
  }): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', { params });
    return data;
  },

  getUser: async (id: string): Promise<{ success: boolean; data: User }> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  createUser: async (payload: CreateUserRequest): Promise<{ success: boolean; data: User }> => {
    const { data } = await apiClient.post('/users', payload);
    return data;
  },

  updateUser: async (
    id: string,
    payload: UpdateUserRequest
  ): Promise<{ success: boolean; data: User }> => {
    const { data } = await apiClient.patch(`/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  setUserStatus: async (
    id: string,
    payload: SetUserStatusRequest
  ): Promise<{ success: boolean; data: User }> => {
    const { data } = await apiClient.patch(`/users/${id}/status`, payload);
    return data;
  },

  resetUserPassword: async (
    id: string,
    payload: ResetUserPasswordRequest
  ): Promise<{ success: boolean; data: User }> => {
    const { data } = await apiClient.post(`/users/${id}/reset-password`, payload);
    return data;
  },

  lookupUsers: async (params?: {
    search?: string;
    role?: Role;
  }): Promise<{ success: boolean; data: UserLookup[] }> => {
    const { data } = await apiClient.get('/users/lookup', { params });
    return data;
  },
};

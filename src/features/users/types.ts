import { Role } from '@/types/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

import { PaginatedResponse } from '@/types/api';
export type { PaginatedResponse };

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: 'SALES_MANAGER';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface SetUserStatusRequest {
  isActive: boolean;
}

export interface ResetUserPasswordRequest {
  newPassword?: string;
}

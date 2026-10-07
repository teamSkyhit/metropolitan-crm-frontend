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

export interface UserLookup {
  id: string;
  name: string;
  role: Role;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

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

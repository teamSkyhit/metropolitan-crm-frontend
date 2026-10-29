export type Role = 'SALES_MANAGER' | 'SUPER_ADMIN' | 'CRM_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

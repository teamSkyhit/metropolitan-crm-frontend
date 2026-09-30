export type Role = 'SALES_MANAGER' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

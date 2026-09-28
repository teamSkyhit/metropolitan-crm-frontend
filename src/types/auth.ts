export type Role = 'Sales Manager' | 'Super Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

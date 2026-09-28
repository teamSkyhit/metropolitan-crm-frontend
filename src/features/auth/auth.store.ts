import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginPlaceholder: () => void;
  logoutPlaceholder: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loginPlaceholder: () => {
    // Placeholder logic for login
  },
  logoutPlaceholder: () => {
    // Placeholder logic for logout
  },
}));

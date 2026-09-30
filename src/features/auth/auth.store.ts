import { create } from 'zustand';
import { User, Role } from '@/types/auth';
import { authService } from './auth.service';
import { tokenStorage } from '@/lib/auth/token';
import { AuthTokens } from './types';

interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user: User, tokens: AuthTokens) => {
    tokenStorage.setToken(tokens.accessToken, tokens.refreshToken);
    set({
      user,
      role: user.role,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout API failed, continuing local cleanup', e);
    } finally {
      tokenStorage.clearToken();
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  initialize: async () => {
    const token = tokenStorage.getToken();
    
    if (!token) {
      set({ isInitializing: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        role: user.role,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      set({ isInitializing: false });
    }
  },
}));

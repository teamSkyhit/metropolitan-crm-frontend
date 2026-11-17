const REFRESH_TOKEN_KEY = 'crm_refresh_token';

let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getToken: (): string | null => {
    return memoryAccessToken;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string, refreshToken?: string): void => {
    memoryAccessToken = token;
    if (typeof window === 'undefined') return;
    if (refreshToken) {
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } catch {
        // Safe fallback in restricted environments or Node 22+ test runners
      }
    }
  },

  clearToken: (): void => {
    memoryAccessToken = null;
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Safe fallback in restricted environments
    }
  },
};

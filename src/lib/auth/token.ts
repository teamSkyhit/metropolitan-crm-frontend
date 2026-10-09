const REFRESH_TOKEN_KEY = 'crm_refresh_token';

let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getToken: (): string | null => {
    return memoryAccessToken;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setToken: (token: string, refreshToken?: string): void => {
    memoryAccessToken = token;
    if (typeof window === 'undefined') return;
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearToken: (): void => {
    memoryAccessToken = null;
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

import { User } from '@/types/auth';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

// Responses based on backend envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: unknown;
}

export interface ApiAuthError {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
}

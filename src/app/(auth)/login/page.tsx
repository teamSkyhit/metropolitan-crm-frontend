'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/features/auth/auth.store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/lib/constants/routes';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing, setAuth } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        router.replace(redirect);
      } else {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isInitializing, router, searchParams]);

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Direct bypass in the component
      const fakeUser = {
        id: 'preview-user-id',
        name: 'Preview Admin',
        email: email || 'admin@demo.com',
        role: 'SUPER_ADMIN' as const,
      };
      const fakeTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
        accessTokenExpiresIn: 3600,
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      setAuth(fakeUser, fakeTokens);

      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        router.replace(redirect);
      } else {
        router.replace(ROUTES.DASHBOARD);
      }
    } catch (err: unknown) {
      const error = err as import('axios').AxiosError<import('@/features/auth/types').ApiAuthError>;

      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else if (error.response?.status === 423) {
        setError('Account temporarily locked due to too many failed attempts.');
      } else if (error.response?.data?.error?.message) {
        setError(error.response.data.error.message);
      } else if (error.response?.status === 500) {
        setError('Internal Server Error (500). Please check the backend logs.');
      } else if ((error.response?.data as { message?: string })?.message) {
        setError((error.response?.data as { message?: string }).message as string);
      } else if (error.message === 'Network Error') {
        setError('Network Error: Could not connect to the server (Check CORS or server status).');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent flash while checking session
  if (isInitializing || isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-metro-navy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Metropolitan Industrial Supplies"
            width={300}
            height={64}
            className="h-16 w-auto mb-4"
            priority
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Sign in to CRM (Preview Mode)
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Backend is bypassed. Enter any email/password to enter!
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded" role="alert">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-metro-navy)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-metro-gold)] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-metro-navy)]"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

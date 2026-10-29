'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/features/auth/auth.store';
import { authService } from '@/features/auth/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/lib/constants/routes';
import { ROLES } from '@/lib/constants/roles';
import { Eye, EyeOff, CheckCircle2, LockKeyhole } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing, setAuth, role } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        router.replace(redirect);
      } else {
        const defaultLanding = role === ROLES.CRM_USER ? ROUTES.ENQUIRIES : ROUTES.DASHBOARD;
        router.replace(defaultLanding);
      }
    }
  }, [isAuthenticated, isInitializing, router, searchParams, role]);

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
      const response = await authService.login({ email, password });
      setAuth(response.user, response.tokens);

      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        router.replace(redirect);
      } else {
        const defaultLanding =
          response.user.role === ROLES.CRM_USER ? ROUTES.ENQUIRIES : ROUTES.DASHBOARD;
        router.replace(defaultLanding);
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
      <div
        className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-[#f4f7fb]"
        role="status"
        aria-live="polite"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d8e0ea] border-t-[var(--color-metro-navy)]"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-[#65758b]">Preparing secure sign in…</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh bg-[#f4f7fb] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[var(--color-metro-navy)] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[80px] border-white/[0.035]" />
        <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#d6a628]/[0.08] blur-3xl" />
        <div className="relative flex justify-center w-full">
          <div className="inline-flex rounded-none bg-white px-6 py-3 shadow-xl">
            <Image
              src="/logo.png"
              alt="Metropolitan Industrial Supplies"
              width={290}
              height={82}
              className="h-16 w-auto sm:h-[68px]"
              priority
            />
          </div>
        </div>
        <div className="relative max-w-xl mx-auto flex flex-col items-center text-center">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#e3ba50]">
            One workspace. Total clarity.
          </p>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-[-0.04em] xl:text-5xl">
            Keep every customer conversation moving forward.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/65">
            Manage enquiries, products, and content from a focused workspace built for the
            Metropolitan team.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/75">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#e3ba50]" /> Centralised enquiries
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#e3ba50]" /> Secure team access
            </div>
          </div>
        </div>
        <p className="relative text-xs text-white/35 text-center w-full">
          Metropolitan Industrial Supplies &middot; Internal CRM
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-9 flex flex-col items-start">
            <Image
              src="/logo.png"
              alt="Metropolitan Industrial Supplies"
              width={221}
              height={63}
              className="mb-8 h-12 w-auto lg:hidden"
              priority
            />
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf0f7] text-[var(--color-metro-navy)]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#15263d]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-[#6a788c]">
              Sign in with your team credentials to continue.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div
                id="login-error"
                className="rounded-xl border border-red-200 bg-red-50 p-4"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#34445a]">
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
                  placeholder="name@company.com"
                  disabled={isLoading}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#34445a]"
                >
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
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
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

            <Button type="submit" className="h-12 w-full" disabled={isLoading}>
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
          <p className="mt-8 text-center text-xs text-[#8a96a6]">
            Authorised team members only · Protected workspace
          </p>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-[#f4f7fb]"
          role="status"
          aria-live="polite"
        >
          <div
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d8e0ea] border-t-[var(--color-metro-navy)]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[#65758b]">Loading secure sign in…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto flex max-w-[400px] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">403</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-500">
          You don&apos;t have permission to access this page. Please contact your administrator if
          you believe this is an error.
        </p>
        <div className="mt-6 flex w-full gap-4">
          <Button className="w-full" onClick={() => router.push(ROUTES.DASHBOARD)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

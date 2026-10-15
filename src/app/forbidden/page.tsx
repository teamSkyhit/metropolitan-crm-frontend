'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { ArrowLeft, ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f4f7fb] px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-[#e2e8f0] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,38,68,0.08)] sm:p-10">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600">
          <ShieldX className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-red-600">Error 403</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#17263b]">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-[#65758b]">
          You don&apos;t have permission to access this page. Please contact your administrator if
          you believe this is an error.
        </p>
        <div className="mt-7 flex w-full gap-4">
          <Button className="w-full" onClick={() => router.push(ROUTES.DASHBOARD)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

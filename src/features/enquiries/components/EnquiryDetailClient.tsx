'use client';

import { useEnquiry } from '../hooks/useEnquiry';
import { CustomerInfoCard } from './CustomerInfoCard';
import { LineItemsTable } from './LineItemsTable';
import { FollowUpsTimeline } from './FollowUpsTimeline';
import { ActionSidebar } from './ActionSidebar';
import { EmptyState } from '@/components/ui/empty-state';
import { hasPermission } from '@/features/auth/permissions';
import { useAuthStore } from '@/features/auth/auth.store';
import { PageHeader } from '@/components/ui/page-header';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { ROLES } from '@/lib/constants/roles';

export function EnquiryDetailClient({ id }: { id: string }) {
  const { data: response, isLoading, isError } = useEnquiry(id);
  const user = useAuthStore((state) => state.user);

  if (!id || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-2xl bg-gray-200"></div>
            <div className="h-40 rounded-2xl bg-gray-200"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-gray-200"></div>
            <div className="h-32 rounded-2xl bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="space-y-4">
        <div className="flex justify-start">
          <Link
            href={ROUTES.ENQUIRIES}
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)] focus-visible:ring-offset-2"
          >
            Back to Enquiries
          </Link>
        </div>
        <EmptyState message="Enquiry not found or you do not have permission to view it." />
      </div>
    );
  }

  const enquiry = response.data;
  const isCrmUser = user?.role === ROLES.CRM_USER;

  if (isCrmUser && enquiry.assignedTo?.id !== user?.id) {
    return (
      <div className="space-y-4">
        <div className="flex justify-start">
          <Link
            href={ROUTES.ENQUIRIES}
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium transition-colors hover:bg-gray-100"
          >
            Back to Enquiries
          </Link>
        </div>
        <EmptyState message="You do not have permission to view this enquiry. Only enquiries assigned to your account are accessible." />
      </div>
    );
  }

  const canEdit = user ? hasPermission(user, 'enquiries:update') : false;
  const canAssign = user ? hasPermission(user, 'enquiries:assign') : false;
  const canFollowUp = user ? hasPermission(user, 'enquiries:follow-up') : false;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href={ROUTES.ENQUIRIES}
          className="mt-1 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Back
        </Link>
        <PageHeader
          title={`Enquiry ${enquiry.id.split('-')[0]}`}
          description="Review the request, update ownership and status, then record each customer follow-up."
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 xl:col-span-2">
          <CustomerInfoCard enquiry={enquiry} />
          <LineItemsTable items={enquiry.lineItems} />
          <FollowUpsTimeline
            enquiryId={enquiry.id}
            followUps={enquiry.followUps}
            canEdit={canFollowUp}
          />
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <ActionSidebar enquiry={enquiry} canEdit={canEdit} canAssign={canAssign} />
        </div>
      </div>
    </div>
  );
}

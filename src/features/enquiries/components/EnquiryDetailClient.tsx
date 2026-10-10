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
import { useParams } from 'next/navigation';

export function EnquiryDetailClient({ id: _propId }: { id: string }) {
  const params = useParams();
  // Read the real ID from the URL at runtime (the prop is always "placeholder" in static export)
  const id = (params?.id as string) || _propId;
  const { data: response, isLoading, isError } = useEnquiry(id);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-40 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
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
  const canEdit = user ? hasPermission(user, 'enquiries:update') : false;
  const canAssign = user ? hasPermission(user, 'enquiries:assign') : false;
  const canFollowUp = user ? hasPermission(user, 'enquiries:follow-up') : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.ENQUIRIES}
          className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)] focus-visible:ring-offset-2"
        >
          Back
        </Link>
        <PageHeader
          title={`Enquiry ${enquiry.id.split('-')[0]}`}
          description="Manage customer enquiry details."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoCard enquiry={enquiry} />
          <LineItemsTable items={enquiry.lineItems} />
          <FollowUpsTimeline
            enquiryId={enquiry.id}
            followUps={enquiry.followUps}
            canEdit={canFollowUp}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ActionSidebar enquiry={enquiry} canEdit={canEdit} canAssign={canAssign} />
        </div>
      </div>
    </div>
  );
}

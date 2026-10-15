'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { useDashboardQuery } from '@/features/dashboard/hooks/useDashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils/format';
import {
  AlertCircle,
  Users,
  Inbox,
  Package,
  CheckCircle,
  ArrowUpRight,
  Clock3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';
import { DashboardRecentEnquiry } from '@/features/dashboard/types';

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  hint,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
  hint: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_5px_22px_rgba(15,38,68,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,38,68,0.09)]">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${colorClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-gray-300 transition-colors group-hover:text-[#b98708]"
          aria-hidden="true"
        />
      </div>
      <div className="mt-5">
        <p className="text-[13px] font-medium text-[#6a788c]">{title}</p>
        <p className="mt-1 text-[30px] font-bold leading-none tracking-[-0.04em] text-[#15263d]">
          {value}
        </p>
        <p className="mt-3 text-xs text-[#8491a3]">{hint}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl border border-gray-200 bg-white"></div>
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-gray-200 bg-white"></div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboardQuery(10);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of CRM operational activity."
          className="items-center sm:items-start text-center sm:text-left"
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of CRM operational activity."
          className="items-center sm:items-start text-center sm:text-left"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800">Failed to load dashboard</h3>
          <p className="text-sm text-red-600 mt-2 mb-4">
            There was an error communicating with the server.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-7 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Good to see you."
          description="Here is what is happening across your sales workspace today."
        />
        <Button className="w-full sm:w-auto" onClick={() => router.push(ROUTES.ENQUIRIES)}>
          View All Enquiries
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Enquiries"
          value={data.counts.total}
          icon={Inbox}
          colorClass="bg-blue-50 text-blue-600"
          hint="All customer requests"
        />
        <StatCard
          title="New"
          value={data.counts.new}
          icon={Package}
          colorClass="bg-amber-50 text-amber-600"
          hint="Waiting for review"
        />
        <StatCard
          title="Assigned"
          value={data.counts.assigned}
          icon={Users}
          colorClass="bg-violet-50 text-violet-600"
          hint="In active ownership"
        />
        <StatCard
          title="Closed Won"
          value={data.counts.closedWon}
          icon={CheckCircle}
          colorClass="bg-emerald-50 text-emerald-600"
          hint="Successfully converted"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_5px_22px_rgba(15,38,68,0.04)] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-[-0.02em] text-[#17263b]">
              Recent Enquiries
            </h2>
            <p className="mt-1 text-sm text-[#718096]">
              Latest customer activity requiring your attention.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-[#f4f7fb] px-3 py-1.5 text-xs font-medium text-[#65758b] sm:flex">
            <Clock3 className="h-3.5 w-3.5" />
            Live overview
          </div>
        </div>

        {data.recentEnquiries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recent enquiries found.</p>
          </div>
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Customer / Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentEnquiries.map((enquiry: DashboardRecentEnquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{enquiry.name}</div>
                    {enquiry.company && (
                      <div className="text-sm text-gray-500">{enquiry.company}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={enquiry.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {enquiry.assignedTo ? enquiry.assignedTo.name : 'Unassigned'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{formatDate(enquiry.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${ROUTES.ENQUIRIES}/${enquiry.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#eef3f8] px-3 text-sm font-semibold text-[var(--color-metro-navy)] transition-colors hover:bg-[#e2eaf3]"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

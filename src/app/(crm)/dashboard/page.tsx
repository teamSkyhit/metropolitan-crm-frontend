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
import { AlertCircle, Users, Inbox, Package, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';
import { DashboardRecentEnquiry } from '@/features/dashboard/types';

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-24"
          ></div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg h-64 shadow-sm"></div>
    </div>
  );
}

export default function DashboardPage() {
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
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Dashboard"
          description="Overview of CRM operational activity."
          className="items-center sm:items-start"
        />
        <Link href={ROUTES.ENQUIRIES} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">View All Enquiries</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enquiries"
          value={data.counts.total}
          icon={Inbox}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="New"
          value={data.counts.new}
          icon={Package}
          colorClass="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Assigned"
          value={data.counts.assigned}
          icon={Users}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Closed Won"
          value={data.counts.closedWon}
          icon={CheckCircle}
          colorClass="bg-green-100 text-green-600"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Enquiries</h3>

        {data.recentEnquiries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recent enquiries found.</p>
          </div>
        ) : (
          <Table>
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
                    <Link href={`${ROUTES.ENQUIRIES}/${enquiry.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-metro-navy)] font-medium hover:text-[var(--color-metro-navy)]/80 hover:bg-gray-100"
                      >
                        View
                      </Button>
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

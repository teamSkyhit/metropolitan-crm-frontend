import { PageHeader } from '@/components/ui/page-header';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Manage your notifications here." />
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Not Implemented</h2>
        <p className="text-gray-600">
          BACKEND DEPENDENCY: The Notifications API is currently missing.
        </p>
      </div>
    </div>
  );
}

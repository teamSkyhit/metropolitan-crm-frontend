import { useState } from 'react';
import { EnquiryDetail, EnquiryStatus } from '../types';
import {
  useUpdateEnquiryStatus,
  useAssignEnquiry,
  useUpdateEnquiryNotes,
} from '../hooks/useEnquiry';
import { useUserLookup } from '@/features/users/hooks/useUserLookup';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/format';

export function ActionSidebar({
  enquiry,
  canEdit,
  canAssign,
}: {
  enquiry: EnquiryDetail;
  canEdit: boolean;
  canAssign: boolean;
}) {
  const [salesNotes, setSalesNotes] = useState(enquiry.salesNotes || '');
  const updateStatus = useUpdateEnquiryStatus(enquiry.id);
  const assignEnquiry = useAssignEnquiry(enquiry.id);
  const updateNotes = useUpdateEnquiryNotes(enquiry.id);
  const { data: usersData } = useUserLookup();

  // Sync internal state if enquiry changes (e.g., successful save)
  const [prevNotesProp, setPrevNotesProp] = useState(enquiry.salesNotes || '');
  if ((enquiry.salesNotes || '') !== prevNotesProp) {
    setPrevNotesProp(enquiry.salesNotes || '');
    setSalesNotes(enquiry.salesNotes || '');
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as EnquiryStatus;
    if (newStatus && newStatus !== enquiry.status) {
      updateStatus.mutate({ status: newStatus });
    }
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value || null;
    assignEnquiry.mutate({ assignedToId: userId });
  };

  const handleNotesSave = () => {
    updateNotes.mutate({ salesNotes: salesNotes.trim() || null });
  };

  return (
    <div className="space-y-6">
      {/* Status & Assignment */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">Current Status</h3>
          <StatusBadge status={enquiry.status} />
        </div>

        {canEdit && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Update Status
            </label>
            <select
              id="status"
              value={enquiry.status}
              onChange={handleStatusChange}
              disabled={updateStatus.isPending}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
            >
              <option value={enquiry.status}>{enquiry.status.replace('_', ' ')}</option>
              {enquiry.allowedStatusTransitions.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
            {updateStatus.isError && (
              <p className="mt-1 text-sm text-red-600">Failed to update status.</p>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          {canAssign ? (
            <select
              id="assignee"
              value={enquiry.assignedTo?.id || ''}
              onChange={handleAssigneeChange}
              disabled={assignEnquiry.isPending}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
            >
              <option value="">Unassigned</option>
              {usersData?.data?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-900">{enquiry.assignedTo?.name || 'Unassigned'}</p>
          )}
          {assignEnquiry.isError && (
            <p className="mt-1 text-sm text-red-600">Failed to reassign.</p>
          )}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-[var(--color-metro-navy)]/5 rounded-lg border border-[var(--color-metro-navy)]/10 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-metro-navy)]">Internal Sales Notes</h3>
        {canEdit ? (
          <div className="space-y-3">
            <textarea
              aria-label="Internal Sales Notes"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
              placeholder="Private notes..."
              value={salesNotes}
              onChange={(e) => setSalesNotes(e.target.value)}
              disabled={updateNotes.isPending}
            />
            <Button
              size="sm"
              onClick={handleNotesSave}
              disabled={updateNotes.isPending || salesNotes === (enquiry.salesNotes || '')}
              className="w-full"
            >
              {updateNotes.isPending ? 'Saving...' : 'Save Notes'}
            </Button>
            {updateNotes.isError && <p className="text-sm text-red-600">Failed to save notes.</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {enquiry.salesNotes || 'No internal notes.'}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-3 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Created:</span>
          <span className="text-gray-900">{formatDate(enquiry.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Updated:</span>
          <span className="text-gray-900">{formatDate(enquiry.updatedAt)}</span>
        </div>
        {enquiry.lineItemCount > 0 && (
          <div className="flex justify-between">
            <span>Items:</span>
            <span className="text-gray-900">{enquiry.lineItemCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

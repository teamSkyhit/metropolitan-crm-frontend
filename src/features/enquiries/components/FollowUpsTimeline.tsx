import { useState } from 'react';
import { EnquiryFollowUp } from '../types';
import { formatDate } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { useAddFollowUp } from '../hooks/useEnquiry';

export function FollowUpsTimeline({
  enquiryId,
  followUps,
  canEdit,
}: {
  enquiryId: string;
  followUps: EnquiryFollowUp[];
  canEdit: boolean;
}) {
  const [note, setNote] = useState('');
  const addFollowUp = useAddFollowUp(enquiryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    addFollowUp.mutate(
      { note: note.trim() },
      {
        onSuccess: () => setNote(''),
      }
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Follow-up History</h2>

      {canEdit && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="followup" className="sr-only">
              Add a note
            </label>
            <textarea
              id="followup"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-metro-navy)] focus:ring-[var(--color-metro-navy)] sm:text-sm p-2 border"
              placeholder="Add a follow-up note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={addFollowUp.isPending}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!note.trim() || addFollowUp.isPending}>
              {addFollowUp.isPending ? 'Saving...' : 'Add Note'}
            </Button>
          </div>
        </form>
      )}

      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {followUps.map((item, itemIdx) => (
            <li key={item.id}>
              <div className="relative pb-8">
                {itemIdx !== followUps.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      <span className="text-xs font-medium text-gray-500">
                        {item.author.name.substring(0, 2).toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500 whitespace-pre-wrap">{item.note}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                      <p className="mt-1">{item.author.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {followUps.length === 0 && (
            <p className="text-sm text-gray-500 italic pb-8">No follow-ups recorded yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

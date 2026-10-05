import { EnquiryDetail } from '../types';

export function CustomerInfoCard({ enquiry }: { enquiry: EnquiryDetail }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Name</dt>
          <dd className="mt-1 text-sm text-gray-900">{enquiry.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Company</dt>
          <dd className="mt-1 text-sm text-gray-900">{enquiry.company || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd className="mt-1 text-sm text-[var(--color-metro-navy)]">
            <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Phone</dt>
          <dd className="mt-1 text-sm text-[var(--color-metro-navy)]">
            <a href={`tel:${enquiry.mobile}`}>{enquiry.mobile}</a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">City</dt>
          <dd className="mt-1 text-sm text-gray-900">{enquiry.city || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Country</dt>
          <dd className="mt-1 text-sm text-gray-900">{enquiry.country || '-'}</dd>
        </div>
      </dl>
      {enquiry.message && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{enquiry.message}</p>
        </div>
      )}
    </div>
  );
}

import { PageHeader } from '@/components/ui/page-header';
import { ROUTES } from '@/lib/constants/routes';
import Link from 'next/link';

export default async function EnquiryDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.ENQUIRIES}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-100 h-9 px-3"
        >
          Back
        </Link>
        <PageHeader title={`Enquiry ${params.id}`} description="Enquiry details." />
      </div>
      <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Enquiry details module coming soon.</p>
      </div>
    </div>
  );
}

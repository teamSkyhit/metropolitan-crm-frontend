import { PageHeader } from '@/components/ui/page-header';
import { ROUTES } from '@/lib/constants/routes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function EnquiryDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ENQUIRIES}>
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
        <PageHeader title={`Enquiry ${params.id}`} description="Enquiry details." />
      </div>
      <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Enquiry details module coming soon.</p>
      </div>
    </div>
  );
}

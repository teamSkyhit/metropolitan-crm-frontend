import { EnquiryDetailClient } from '@/features/enquiries/components/EnquiryDetailClient';

export default async function EnquiryDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <div className="max-w-7xl mx-auto">
      <EnquiryDetailClient id={params.id} />
    </div>
  );
}

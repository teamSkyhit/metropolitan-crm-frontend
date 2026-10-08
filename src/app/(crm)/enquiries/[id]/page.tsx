import { EnquiryDetailClient } from '@/features/enquiries/components/EnquiryDetailClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-7xl mx-auto">
      <EnquiryDetailClient id={id} />
    </div>
  );
}

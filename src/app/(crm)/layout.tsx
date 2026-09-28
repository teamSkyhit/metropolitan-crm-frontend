import { CrmLayout } from '@/components/layout/crm-layout';

export default function CrmAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CrmLayout>{children}</CrmLayout>;
}

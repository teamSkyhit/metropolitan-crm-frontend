import { CrmLayout } from '@/components/layout/crm-layout';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

export default function CrmAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CrmLayout>{children}</CrmLayout>
    </AuthGuard>
  );
}

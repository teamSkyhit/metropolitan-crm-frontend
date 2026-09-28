import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';

export default function RootPage() {
  // Currently redirecting to login. Once auth is implemented,
  // it should redirect to dashboard if authenticated.
  redirect(ROUTES.LOGIN);
}

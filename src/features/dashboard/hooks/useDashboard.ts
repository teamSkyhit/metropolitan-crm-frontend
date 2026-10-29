import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../dashboard.service';
import { useAuthStore } from '@/features/auth/auth.store';
import { canAccessRoute } from '@/features/auth/permissions';
import { ROUTES } from '@/lib/constants/routes';

export function useDashboardQuery(limit: number = 10) {
  const { user } = useAuthStore();
  const canAccessDashboard = Boolean(user && canAccessRoute(user.role, ROUTES.DASHBOARD));

  return useQuery({
    queryKey: ['dashboard', { limit }],
    queryFn: () => dashboardService.getDashboardData(limit),
    enabled: canAccessDashboard,
  });
}

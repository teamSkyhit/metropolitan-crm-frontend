import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../dashboard.service';

export function useDashboardQuery(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', { limit }],
    queryFn: () => dashboardService.getDashboardData(limit),
  });
}

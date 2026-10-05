import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../categories.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories', { page: 1, limit: 100 }],
    queryFn: () => categoriesService.getCategories(1, 100),
  });
}

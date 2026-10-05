import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../categories.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(1, 100),
  });
}

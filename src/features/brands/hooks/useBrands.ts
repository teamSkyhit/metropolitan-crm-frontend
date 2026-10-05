import { useQuery } from '@tanstack/react-query';
import { brandsService } from '../brands.service';

export function useBrands() {
  return useQuery({
    queryKey: ['brands', { page: 1, limit: 100 }],
    queryFn: () => brandsService.getBrands(1, 100),
  });
}

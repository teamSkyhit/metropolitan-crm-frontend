import { useQuery } from '@tanstack/react-query';
import { brandsService } from '../brands.service';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsService.getBrands(1, 100),
  });
}

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productsService } from '../products.service';
import { GetProductsQuery } from '../types';

export function useProducts(query: GetProductsQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => productsService.getProducts(query),
    placeholderData: keepPreviousData,
  });
}

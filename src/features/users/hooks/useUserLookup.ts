import { useQuery } from '@tanstack/react-query';
import { usersService } from '../users.service';

export function useUserLookup(role?: string) {
  return useQuery({
    queryKey: ['users', 'lookup', { role }],
    queryFn: () => usersService.getLookup(role),
    staleTime: 5 * 60 * 1000,
  });
}

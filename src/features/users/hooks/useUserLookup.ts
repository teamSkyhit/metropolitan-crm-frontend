/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../users.service';

export function useUserLookup(role?: string) {
  return useQuery({
    queryKey: ['users', 'lookup', { role }],
    queryFn: () => usersService.lookupUsers({ role: role as any }),
    staleTime: 5 * 60 * 1000,
  });
}

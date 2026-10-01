import { apiClient } from '@/lib/api/client';
import { UserLookupResponse } from './types';

export const usersService = {
  async getLookup(role?: string): Promise<UserLookupResponse> {
    const response = await apiClient.get<UserLookupResponse>('/users/lookup', {
      params: { role },
    });
    return response.data;
  },
};

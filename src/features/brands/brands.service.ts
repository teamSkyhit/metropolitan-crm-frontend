import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/features/auth/types';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export const brandsService = {
  async getBrands(page = 1, limit = 20) {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/brands', {
      params: { page, limit },
    });
    return { data: response.data.data, meta: response.data.meta };
  },
};

import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/features/auth/types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export const categoriesService = {
  async getCategories(page = 1, limit = 100) {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories', {
      params: { page, limit },
    });
    return { data: response.data.data, meta: response.data.meta };
  },
};

import { apiClient } from '@/lib/api/client';
import {
  Category,
  CategoryQuery,
  CategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types';

export const categoriesService = {
  async getCategories(query?: CategoryQuery): Promise<CategoriesResponse> {
    const { data } = await apiClient.get<CategoriesResponse>('/categories', { params: query });
    return data;
  },

  async getCategory(id: string): Promise<Category> {
    const { data } = await apiClient.get<{ data: Category }>(`/categories/${id}`);
    return data.data;
  },

  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    const { data } = await apiClient.post<{ data: Category }>('/categories', payload);
    return data.data;
  },

  async updateCategory(id: string, payload: UpdateCategoryRequest): Promise<Category> {
    const { data } = await apiClient.patch<{ data: Category }>(`/categories/${id}`, payload);
    return data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  async restoreCategory(id: string): Promise<Category> {
    const { data } = await apiClient.post<{ data: Category }>(`/categories/${id}/restore`);
    return data.data;
  },

  async uploadBanner(id: string, image: File): Promise<Category> {
    const formData = new FormData();
    formData.append('banner', image);
    const { data } = await apiClient.put<{ data: Category }>(`/categories/${id}/banner`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data.data;
  },

  async deleteBanner(id: string): Promise<Category> {
    const { data } = await apiClient.delete<{ data: Category }>(`/categories/${id}/banner`);
    return data.data;
  },
};

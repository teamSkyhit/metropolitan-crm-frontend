import { apiClient } from '@/lib/api/client';
import {
  Brand,
  BrandQuery,
  PaginatedResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from './types';

const basePath = '/brands';

export const brandsService = {
  getBrands: async (query?: BrandQuery): Promise<PaginatedResponse<Brand>> => {
    const res = await apiClient.get<PaginatedResponse<Brand>>(basePath, { params: query });
    return res.data;
  },

  getBrand: async (id: string): Promise<Brand> => {
    const res = await apiClient.get<{ data: Brand }>(`${basePath}/${id}`);
    return res.data.data;
  },

  createBrand: async (data: CreateBrandRequest): Promise<Brand> => {
    const res = await apiClient.post<{ data: Brand }>(basePath, data);
    return res.data.data;
  },

  updateBrand: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const res = await apiClient.patch<{ data: Brand }>(`${basePath}/${id}`, data);
    return res.data.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`);
  },

  restoreBrand: async (id: string): Promise<Brand> => {
    const res = await apiClient.post<{ data: Brand }>(`${basePath}/${id}/restore`);
    return res.data.data;
  },

  uploadLogo: async (id: string, file: File): Promise<Brand> => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await apiClient.put<{ data: Brand }>(`${basePath}/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  deleteLogo: async (id: string): Promise<Brand> => {
    const res = await apiClient.delete<{ data: Brand }>(`${basePath}/${id}/logo`);
    return res.data.data;
  },

  uploadBanner: async (id: string, file: File): Promise<Brand> => {
    const formData = new FormData();
    formData.append('banner', file);
    const res = await apiClient.put<{ data: Brand }>(`${basePath}/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  deleteBanner: async (id: string): Promise<Brand> => {
    const res = await apiClient.delete<{ data: Brand }>(`${basePath}/${id}/banner`);
    return res.data.data;
  },
};

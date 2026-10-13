import { apiClient } from '@/lib/api/client';
import { Media, MediaQuery } from './types';
import { ApiResponse } from '@/types/api';

export interface PaginatedMediaResponse {
  data: Media[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const mediaService = {
  getMedia: async (query?: MediaQuery): Promise<PaginatedMediaResponse> => {
    const response = await apiClient.get<PaginatedMediaResponse>('/media', { params: query });
    return response.data;
  },

  getMediaById: async (id: string): Promise<Media> => {
    const response = await apiClient.get<ApiResponse<Media>>(`/media/${id}`);
    return response.data.data ?? (response.data as unknown as Media);
  },

  uploadMedia: async (file: File): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Media>>('/media/upload', formData);
    // Assuming backend returns ApiResponse<Media> or just Media depending on the standard
    // Some backend APIs return { data: Media }, let's return response.data.data if ApiResponse is used
    return response.data.data ?? response.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  },
};

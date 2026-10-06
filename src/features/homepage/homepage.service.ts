import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import {
  HomepageSection,
  CreateHomepageSectionRequest,
  UpdateHomepageSectionRequest,
  ReorderHomepageSectionsRequest,
} from './types';

export const homepageService = {
  async getSections(): Promise<HomepageSection[]> {
    const response = await apiClient.get<ApiResponse<HomepageSection[]>>('/homepage/sections');
    return response.data.data;
  },

  async getSection(id: string): Promise<HomepageSection> {
    const response = await apiClient.get<ApiResponse<HomepageSection>>(`/homepage/sections/${id}`);
    return response.data.data;
  },

  async createSection(payload: CreateHomepageSectionRequest): Promise<HomepageSection> {
    const response = await apiClient.post<ApiResponse<HomepageSection>>(
      '/homepage/sections',
      payload
    );
    return response.data.data;
  },

  async updateSection(id: string, payload: UpdateHomepageSectionRequest): Promise<HomepageSection> {
    const response = await apiClient.patch<ApiResponse<HomepageSection>>(
      `/homepage/sections/${id}`,
      payload
    );
    return response.data.data;
  },

  async reorderSections(payload: ReorderHomepageSectionsRequest): Promise<void> {
    await apiClient.patch('/homepage/sections/reorder', payload);
  },

  async deleteSection(id: string): Promise<void> {
    await apiClient.delete(`/homepage/sections/${id}`);
  },
};

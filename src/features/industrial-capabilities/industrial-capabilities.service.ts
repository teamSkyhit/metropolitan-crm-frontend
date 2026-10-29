import { apiClient } from '@/lib/api/client';
import {
  IndustrialCapability,
  IndustrialCapabilitiesResponse,
  IndustrialCapabilityQuery,
  CreateIndustrialCapabilityRequest,
  UpdateIndustrialCapabilityRequest,
  IndustrialCapabilitySectionSettings,
  UpdateIndustrialCapabilitySectionSettingsRequest,
} from './types';

export const industrialCapabilitiesService = {
  async getCapabilities(
    query?: IndustrialCapabilityQuery
  ): Promise<IndustrialCapabilitiesResponse> {
    const { data } = await apiClient.get<IndustrialCapabilitiesResponse>(
      '/industrial-capabilities',
      {
        params: query,
      }
    );
    return data;
  },

  async getCapability(id: string): Promise<IndustrialCapability> {
    const { data } = await apiClient.get<{ data: IndustrialCapability }>(
      `/industrial-capabilities/${id}`
    );
    return data.data;
  },

  async createCapability(
    payload: CreateIndustrialCapabilityRequest
  ): Promise<IndustrialCapability> {
    const { data } = await apiClient.post<{ data: IndustrialCapability }>(
      '/industrial-capabilities',
      payload
    );
    return data.data;
  },

  async updateCapability(
    id: string,
    payload: UpdateIndustrialCapabilityRequest
  ): Promise<IndustrialCapability> {
    const { data } = await apiClient.patch<{ data: IndustrialCapability }>(
      `/industrial-capabilities/${id}`,
      payload
    );
    return data.data;
  },

  async deleteCapability(id: string): Promise<void> {
    await apiClient.delete(`/industrial-capabilities/${id}`);
  },

  async restoreCapability(id: string): Promise<IndustrialCapability> {
    const { data } = await apiClient.post<{ data: IndustrialCapability }>(
      `/industrial-capabilities/${id}/restore`
    );
    return data.data;
  },

  async reorderCapabilities(capabilityIds: string[]): Promise<void> {
    await apiClient.patch('/industrial-capabilities/reorder', { capabilityIds });
  },

  async uploadImage(id: string, file: File): Promise<IndustrialCapability> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.put<{ data: IndustrialCapability }>(
      `/industrial-capabilities/${id}/image`,
      formData
    );
    return data.data;
  },

  async deleteImage(id: string): Promise<IndustrialCapability> {
    const { data } = await apiClient.delete<{ data: IndustrialCapability }>(
      `/industrial-capabilities/${id}/image`
    );
    return data.data;
  },

  async getSectionSettings(): Promise<IndustrialCapabilitySectionSettings> {
    const { data } = await apiClient.get<{ data: IndustrialCapabilitySectionSettings }>(
      '/industrial-capabilities/settings'
    );
    return data.data;
  },

  async updateSectionSettings(
    payload: UpdateIndustrialCapabilitySectionSettingsRequest
  ): Promise<IndustrialCapabilitySectionSettings> {
    const { data } = await apiClient.patch<{ data: IndustrialCapabilitySectionSettings }>(
      '/industrial-capabilities/settings',
      payload
    );
    return data.data;
  },
};

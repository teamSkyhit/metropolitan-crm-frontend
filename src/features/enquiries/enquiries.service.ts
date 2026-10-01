import { apiClient } from '@/lib/api/client';
import {
  EnquiryListResponse,
  GetEnquiriesQuery,
  EnquiryDetailResponse,
  ChangeEnquiryStatusRequest,
  AssignEnquiryRequest,
  AddFollowUpRequest,
  UpdateEnquiryRequest,
  EnquiryFollowUp,
} from './types';

export const enquiriesService = {
  async getEnquiries(query: GetEnquiriesQuery = {}): Promise<EnquiryListResponse> {
    const response = await apiClient.get<EnquiryListResponse>('/enquiries', {
      params: query,
    });
    return response.data;
  },

  async getEnquiryById(id: string): Promise<EnquiryDetailResponse> {
    const response = await apiClient.get<EnquiryDetailResponse>(`/enquiries/${id}`);
    return response.data;
  },

  async updateStatus(
    id: string,
    payload: ChangeEnquiryStatusRequest
  ): Promise<EnquiryDetailResponse> {
    const response = await apiClient.patch<EnquiryDetailResponse>(
      `/enquiries/${id}/status`,
      payload
    );
    return response.data;
  },

  async assignEnquiry(id: string, payload: AssignEnquiryRequest): Promise<EnquiryDetailResponse> {
    const response = await apiClient.put<EnquiryDetailResponse>(
      `/enquiries/${id}/assignee`,
      payload
    );
    return response.data;
  },

  async addFollowUp(
    id: string,
    payload: AddFollowUpRequest
  ): Promise<{ success: boolean; data: EnquiryFollowUp }> {
    const response = await apiClient.post<{ success: boolean; data: EnquiryFollowUp }>(
      `/enquiries/${id}/follow-ups`,
      payload
    );
    return response.data;
  },

  async updateNotes(id: string, payload: UpdateEnquiryRequest): Promise<EnquiryDetailResponse> {
    const response = await apiClient.patch<EnquiryDetailResponse>(`/enquiries/${id}`, payload);
    return response.data;
  },
};

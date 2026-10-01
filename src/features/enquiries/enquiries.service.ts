import { apiClient } from '@/lib/api/client';
import { EnquiryListResponse, GetEnquiriesQuery } from './types';

export const enquiriesService = {
  async getEnquiries(query: GetEnquiriesQuery = {}): Promise<EnquiryListResponse> {
    const response = await apiClient.get<EnquiryListResponse>('/enquiries', {
      params: query,
    });
    return response.data;
  },
};

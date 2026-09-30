import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/features/auth/types';

export interface EnquirySummary {
  id: string;
  name: string;
  company: string | null;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const enquiriesService = {
  async getEnquiries(page = 1, limit = 20) {
    const response = await apiClient.get<ApiResponse<EnquirySummary[]>>('/enquiries', {
      params: { page, limit },
    });
    return { data: response.data.data, meta: response.data.meta };
  },
};

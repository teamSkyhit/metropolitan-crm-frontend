import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import { EnquiryDashboard } from './types';

export const dashboardService = {
  async getDashboardData(limit: number = 10): Promise<EnquiryDashboard> {
    const response = await apiClient.get<ApiResponse<EnquiryDashboard>>('/enquiries/dashboard', {
      params: { limit },
    });
    return response.data.data;
  },
};

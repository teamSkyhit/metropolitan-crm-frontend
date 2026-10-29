import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';
import { EnquiryDashboard, DashboardRecentEnquiry } from './types';

interface DashboardSummaryApiResponse {
  totalEnquiries: number;
  unassigned: number;
  new: number;
  assigned: number;
  contacted: number;
  quotationSent: number;
  negotiation: number;
  closedWon: number;
  closedLost: number;
}

export const dashboardService = {
  async getDashboardData(limit: number = 10): Promise<EnquiryDashboard> {
    try {
      // Primary: Query the dedicated backend dashboard endpoints
      const [summaryRes, recentRes] = await Promise.all([
        apiClient.get<ApiResponse<DashboardSummaryApiResponse>>('/dashboard/summary'),
        apiClient.get<ApiResponse<DashboardRecentEnquiry[]>>('/dashboard/recent-enquiries', {
          params: { limit },
        }),
      ]);

      const summary = summaryRes.data.data;
      const recent = recentRes.data.data;

      return {
        counts: {
          total: summary?.totalEnquiries ?? 0,
          new: summary?.new ?? 0,
          assigned: summary?.assigned ?? 0,
          contacted: summary?.contacted ?? 0,
          quotationSent: summary?.quotationSent ?? 0,
          negotiation: summary?.negotiation ?? 0,
          closedWon: summary?.closedWon ?? 0,
          closedLost: summary?.closedLost ?? 0,
        },
        recentEnquiries: recent || [],
      };
    } catch (primaryErr: unknown) {
      // If error is 401/403 auth failure, do not mask it with fallback
      const status = (primaryErr as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        throw primaryErr;
      }

      // Fallback: Query legacy composite endpoint if dedicated route fails
      const fallbackRes = await apiClient.get<ApiResponse<EnquiryDashboard>>(
        '/enquiries/dashboard',
        {
          params: { limit },
        }
      );
      return fallbackRes.data.data;
    }
  },
};

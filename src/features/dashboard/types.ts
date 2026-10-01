import { EnquiryStatus } from '@/features/enquiries/types';

export interface EnquiryDashboardCounts {
  total: number;
  new: number;
  assigned: number;
  contacted: number;
  quotationSent: number;
  negotiation: number;
  closedWon: number;
  closedLost: number;
}

export interface DashboardRecentEnquiry {
  id: string;
  name: string;
  company: string | null;
  status: EnquiryStatus;
  assignedTo: { id: string; name: string } | null;
  createdAt: string;
}

export interface EnquiryDashboard {
  counts: EnquiryDashboardCounts;
  recentEnquiries: DashboardRecentEnquiry[];
}

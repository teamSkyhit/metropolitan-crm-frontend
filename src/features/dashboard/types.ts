export type EnquiryStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

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

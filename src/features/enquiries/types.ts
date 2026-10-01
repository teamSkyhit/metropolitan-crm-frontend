import { EnquiryStatus } from '@/features/dashboard/types';

export interface PersonRef {
  id: string;
  name: string;
}

export interface EnquirySummary {
  id: string;
  name: string;
  company: string | null;
  email: string;
  mobile: string;
  city: string | null;
  status: EnquiryStatus;
  assignedTo: PersonRef | null;
  lineItemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EnquiryListResponse {
  success: boolean;
  data: EnquirySummary[];
  meta: {
    pagination: PaginationMeta;
  };
}

export interface GetEnquiriesQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  status?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

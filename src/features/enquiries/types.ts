export const ENQUIRY_STATUSES = [
  'NEW',
  'ASSIGNED',
  'CONTACTED',
  'QUOTATION_SENT',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

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

export interface EnquiryLineItem {
  id: string;
  productId: string;
  sku: string;
  productName: string | null;
  quantity: number;
}

export interface EnquiryStatusChange {
  id: string;
  fromStatus: EnquiryStatus | null;
  toStatus: EnquiryStatus;
  note: string | null;
  changedBy: PersonRef;
  createdAt: string;
}

export interface EnquiryFollowUp {
  id: string;
  note: string;
  author: PersonRef;
  createdAt: string;
}

export interface EnquiryDetail {
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
  state: string | null;
  country: string | null;
  message: string | null;
  salesNotes: string | null;
  assignedAt: string | null;
  closedAt: string | null;
  allowedStatusTransitions: EnquiryStatus[];
  lineItems: EnquiryLineItem[];
  followUps: EnquiryFollowUp[];
  statusHistory: EnquiryStatusChange[];
}

export interface EnquiryDetailResponse {
  success: boolean;
  data: EnquiryDetail;
}

export interface ChangeEnquiryStatusRequest {
  status: EnquiryStatus;
  note?: string;
}

export interface AssignEnquiryRequest {
  assignedToId: string | null;
}

export interface AddFollowUpRequest {
  note: string;
}

export interface UpdateEnquiryRequest {
  salesNotes: string | null;
}

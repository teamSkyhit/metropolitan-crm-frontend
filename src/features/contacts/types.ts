export type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';

export interface Contact {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  company?: string;
  pageUrl?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  data: Contact[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UpdateContactStatusPayload {
  status: ContactStatus;
}

export interface ContactsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

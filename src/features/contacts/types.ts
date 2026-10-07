export type ContactStatus = 'New' | 'Contacted' | 'Closed';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  data: Contact[];
}

export interface UpdateContactStatusPayload {
  status: ContactStatus;
}

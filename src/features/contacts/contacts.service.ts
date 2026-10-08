import { apiClient } from '@/lib/api/client';
import { Contact, ContactsResponse, ContactsQuery, UpdateContactStatusPayload } from './types';

export const contactsService = {
  getContacts: async (params?: ContactsQuery): Promise<ContactsResponse> => {
    const response = await apiClient.get<ContactsResponse>('/contacts', { params });
    return response.data;
  },

  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get<{ data: Contact }>(`/contacts/${id}`);
    return response.data.data;
  },

  updateContactStatus: async (
    id: string,
    payload: UpdateContactStatusPayload
  ): Promise<Contact> => {
    const response = await apiClient.patch<{ data: Contact }>(`/contacts/${id}/status`, payload);
    return response.data.data;
  },

  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },
};

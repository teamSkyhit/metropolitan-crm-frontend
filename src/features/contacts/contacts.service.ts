import { apiClient } from '@/lib/api/client';
import { Contact, ContactsResponse, UpdateContactStatusPayload } from './types';

export const contactsService = {
  getContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get<ContactsResponse>('/api/v1/contacts');
    return response.data.data;
  },

  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get<{ data: Contact }>(`/api/v1/contacts/${id}`);
    return response.data.data;
  },

  updateContactStatus: async (
    id: string,
    payload: UpdateContactStatusPayload
  ): Promise<Contact> => {
    const response = await apiClient.patch<{ data: Contact }>(
      `/api/v1/contacts/${id}/status`,
      payload
    );
    return response.data.data;
  },

  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/contacts/${id}`);
  },
};

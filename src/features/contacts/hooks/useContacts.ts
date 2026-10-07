import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsService } from '../contacts.service';
import { UpdateContactStatusPayload } from '../types';

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  detail: (id: string) => [...contactKeys.all, 'detail', id] as const,
};

export const useContacts = () => {
  return useQuery({
    queryKey: contactKeys.lists(),
    queryFn: () => contactsService.getContacts(),
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactsService.getContactById(id),
    enabled: !!id,
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContactStatusPayload }) =>
      contactsService.updateContactStatus(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

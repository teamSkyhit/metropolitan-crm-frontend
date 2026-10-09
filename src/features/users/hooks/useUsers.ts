import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/features/users/users.service';
import { Role } from '@/types/auth';
import {
  CreateUserRequest,
  UpdateUserRequest,
  SetUserStatusRequest,
  ResetUserPasswordRequest,
} from '@/features/users/types';

export const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...USERS_KEYS.lists(), { filters }] as const,
  details: () => [...USERS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
  lookups: () => [...USERS_KEYS.all, 'lookup'] as const,
  lookup: (filters: string) => [...USERS_KEYS.lookups(), { filters }] as const,
};

export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: 'true' | 'false';
}) {
  return useQuery({
    queryKey: USERS_KEYS.list(JSON.stringify(params)),
    queryFn: () => usersService.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USERS_KEYS.detail(id),
    queryFn: () => usersService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => usersService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lookups() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      usersService.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lookups() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lookups() });
    },
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetUserStatusRequest }) =>
      usersService.setUserStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lookups() });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResetUserPasswordRequest }) =>
      usersService.resetUserPassword(id, payload),
  });
}

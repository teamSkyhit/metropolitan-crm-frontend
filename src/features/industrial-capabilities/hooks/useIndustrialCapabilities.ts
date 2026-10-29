import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { industrialCapabilitiesService } from '../industrial-capabilities.service';
import {
  IndustrialCapabilityQuery,
  CreateIndustrialCapabilityRequest,
  UpdateIndustrialCapabilityRequest,
  UpdateIndustrialCapabilitySectionSettingsRequest,
} from '../types';

export const industrialCapabilitiesKeys = {
  all: ['industrial-capabilities'] as const,
  lists: () => [...industrialCapabilitiesKeys.all, 'list'] as const,
  list: (query?: IndustrialCapabilityQuery) =>
    [...industrialCapabilitiesKeys.lists(), query] as const,
  details: () => [...industrialCapabilitiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...industrialCapabilitiesKeys.details(), id] as const,
  settings: () => [...industrialCapabilitiesKeys.all, 'settings'] as const,
};

export const useIndustrialCapabilities = (query?: IndustrialCapabilityQuery) => {
  return useQuery({
    queryKey: industrialCapabilitiesKeys.list(query),
    queryFn: () => industrialCapabilitiesService.getCapabilities(query),
  });
};

export const useIndustrialCapability = (id: string) => {
  return useQuery({
    queryKey: industrialCapabilitiesKeys.detail(id),
    queryFn: () => industrialCapabilitiesService.getCapability(id),
    enabled: !!id,
  });
};

export const useCreateIndustrialCapability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIndustrialCapabilityRequest) =>
      industrialCapabilitiesService.createCapability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
    },
  });
};

export const useUpdateIndustrialCapability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIndustrialCapabilityRequest }) =>
      industrialCapabilitiesService.updateCapability(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: industrialCapabilitiesKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteIndustrialCapability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => industrialCapabilitiesService.deleteCapability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
    },
  });
};

export const useRestoreIndustrialCapability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => industrialCapabilitiesService.restoreCapability(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.detail(id) });
    },
  });
};

export const useReorderIndustrialCapabilities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (capabilityIds: string[]) =>
      industrialCapabilitiesService.reorderCapabilities(capabilityIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
    },
  });
};

export const useUploadIndustrialCapabilityImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      industrialCapabilitiesService.uploadImage(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: industrialCapabilitiesKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteIndustrialCapabilityImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => industrialCapabilitiesService.deleteImage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.detail(id) });
    },
  });
};

export const useIndustrialCapabilitySettings = () => {
  return useQuery({
    queryKey: industrialCapabilitiesKeys.settings(),
    queryFn: () => industrialCapabilitiesService.getSectionSettings(),
  });
};

export const useUpdateIndustrialCapabilitySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateIndustrialCapabilitySectionSettingsRequest) =>
      industrialCapabilitiesService.updateSectionSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: industrialCapabilitiesKeys.settings() });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homepageService } from '../homepage.service';
import {
  CreateHomepageSectionRequest,
  UpdateHomepageSectionRequest,
  ReorderHomepageSectionsRequest,
} from '../types';

export const homepageKeys = {
  all: ['homepage-sections'] as const,
  lists: () => [...homepageKeys.all, 'list'] as const,
  detail: (id: string) => [...homepageKeys.all, 'detail', id] as const,
};

export function useHomepageSections() {
  return useQuery({
    queryKey: homepageKeys.lists(),
    queryFn: () => homepageService.getSections(),
  });
}

export function useHomepageSection(id: string) {
  return useQuery({
    queryKey: homepageKeys.detail(id),
    queryFn: () => homepageService.getSection(id),
    enabled: !!id,
  });
}

export function useCreateHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHomepageSectionRequest) => homepageService.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepageKeys.lists() });
    },
  });
}

export function useUpdateHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHomepageSectionRequest }) =>
      homepageService.updateSection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homepageKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: homepageKeys.lists() });
    },
  });
}

export function useReorderHomepageSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderHomepageSectionsRequest) => homepageService.reorderSections(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepageKeys.lists() });
    },
  });
}

export function useDeleteHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => homepageService.deleteSection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: homepageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: homepageKeys.detail(id) });
    },
  });
}

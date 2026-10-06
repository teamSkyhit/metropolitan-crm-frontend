import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../media.service';
import { MediaQuery } from '../types';

export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (query: MediaQuery) => [...mediaKeys.lists(), query] as const,
};

export function useMedia(query: MediaQuery = {}) {
  return useQuery({
    queryKey: mediaKeys.list(query),
    queryFn: () => mediaService.getMedia(query),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => mediaService.uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
}

export function useMediaById(id?: string | null) {
  return useQuery({
    queryKey: [...mediaKeys.all, 'detail', id],
    queryFn: () => mediaService.getMediaById(id!),
    enabled: !!id,
  });
}

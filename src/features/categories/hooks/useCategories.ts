import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { CategoryQuery, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export const useCategories = (query?: CategoryQuery) => {
  return useQuery({
    queryKey: ['categories', query],
    queryFn: () => categoriesService.getCategories(query),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesService.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => categoriesService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      categoriesService.updateCategory(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.restoreCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
    },
  });
};

export const useUploadCategoryBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, image }: { id: string; image: File }) =>
      categoriesService.uploadBanner(id, image),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
};

export const useDeleteCategoryBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteBanner(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
    },
  });
};

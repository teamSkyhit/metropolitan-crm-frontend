import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsService } from '../brands.service';
import { BrandQuery, CreateBrandRequest, UpdateBrandRequest } from '../types';

export const useBrands = (query: BrandQuery = {}) => {
  return useQuery({
    queryKey: ['brands', query],
    queryFn: () => brandsService.getBrands(query),
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => brandsService.getBrand(id),
    enabled: !!id,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandsService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      brandsService.updateBrand(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsService.deleteBrand(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
    },
  });
};

export const useRestoreBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsService.restoreBrand(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => brandsService.uploadLogo(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useDeleteLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsService.deleteLogo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUploadBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => brandsService.uploadBanner(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brand', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsService.deleteBanner(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

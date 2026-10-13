import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../products.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductSpecificationsRequest,
} from '../types';

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getProductById(id),
    retry: false,
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductRequest) => productsService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductRequest) => productsService.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => productsService.updateProductImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => productsService.deleteProductImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductSpecifications(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductSpecificationsRequest) =>
      productsService.updateProductSpecifications(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ── Features Hooks ──────────────────────────────────────────────────────────
export function useAddProductFeature(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: import('../types').CreateProductFeatureRequest) =>
      productsService.addProductFeature(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useUpdateProductFeature(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      featureId,
      payload,
    }: {
      featureId: string;
      payload: import('../types').UpdateProductFeatureRequest;
    }) => productsService.updateProductFeature(id, featureId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useReorderProductFeatures(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureIds: string[]) => productsService.reorderProductFeatures(id, featureIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProductFeature(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureId: string) => productsService.deleteProductFeature(id, featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

// ── Key Benefits Hooks ──────────────────────────────────────────────────────
export function useAddProductKeyBenefit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: import('../types').CreateProductKeyBenefitRequest) =>
      productsService.addProductKeyBenefit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useUpdateProductKeyBenefit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      benefitId,
      payload,
    }: {
      benefitId: string;
      payload: import('../types').UpdateProductKeyBenefitRequest;
    }) => productsService.updateProductKeyBenefit(id, benefitId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useReorderProductKeyBenefits(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (benefitIds: string[]) => productsService.reorderProductKeyBenefits(id, benefitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProductKeyBenefit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (benefitId: string) => productsService.deleteProductKeyBenefit(id, benefitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

// ── Related Products Hook ───────────────────────────────────────────────────
export function useSetRelatedProducts(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relatedProductIds: string[]) =>
      productsService.setRelatedProducts(id, relatedProductIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

// ── Product Gallery Hooks ───────────────────────────────────────────────────
export function useUploadProductGallery(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => productsService.uploadProductGallery(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useReorderProductGallery(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageIds: string[]) => productsService.reorderProductGallery(id, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useSetProductPrimaryImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (galleryImageId: string) =>
      productsService.setProductPrimaryImage(id, galleryImageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductGalleryImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (galleryImageId: string) =>
      productsService.deleteProductGalleryImage(id, galleryImageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ── Product Videos Hooks ────────────────────────────────────────────────────
export function useUploadProductVideos(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, title }: { files: File[]; title?: string }) =>
      productsService.uploadProductVideos(id, files, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useUpdateProductVideo(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      videoId,
      payload,
    }: {
      videoId: string;
      payload: import('../types').UpdateProductVideoRequest;
    }) => productsService.updateProductVideo(id, videoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useReorderProductVideos(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoIds: string[]) => productsService.reorderProductVideos(id, videoIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProductVideo(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => productsService.deleteProductVideo(id, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

// ── Product Documents Hooks ─────────────────────────────────────────────────
export function useUploadProductDocuments(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, title }: { files: File[]; title?: string }) =>
      productsService.uploadProductDocuments(id, files, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useUpdateProductDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      payload,
    }: {
      documentId: string;
      payload: import('../types').UpdateProductDocumentRequest;
    }) => productsService.updateProductDocument(id, documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useReorderProductDocuments(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentIds: string[]) => productsService.reorderProductDocuments(id, documentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProductDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => productsService.deleteProductDocument(id, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

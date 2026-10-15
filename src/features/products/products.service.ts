import { apiClient } from '@/lib/api/client';
import {
  Product,
  ProductListResponse,
  GetProductsQuery,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductSpecificationsRequest,
} from './types';

export const productsService = {
  async getProducts(query: GetProductsQuery = {}): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/products', {
      params: query,
    });
    return response.data;
  },

  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data;
  },

  async createProduct(payload: CreateProductRequest): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.post<{ success: boolean; data: Product }>(
      '/products',
      payload
    );
    return response.data;
  },

  async updateProduct(
    id: string,
    payload: UpdateProductRequest
  ): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.patch<{ success: boolean; data: Product }>(
      `/products/${id}`,
      payload
    );
    return response.data;
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/products/${id}`);
    return response.data;
  },

  async updateProductImage(id: string, file: File): Promise<{ success: boolean; data: Product }> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.put<{ success: boolean; data: Product }>(
      `/products/${id}/image`,
      formData
    );
    return response.data;
  },

  async deleteProductImage(id: string): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.delete<{ success: boolean; data: Product }>(
      `/products/${id}/image`
    );
    return response.data;
  },

  async updateProductSpecifications(
    id: string,
    payload: UpdateProductSpecificationsRequest
  ): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.put<{ success: boolean; data: Product }>(
      `/products/${id}/specifications`,
      payload
    );
    return response.data;
  },

  // ── Features ─────────────────────────────────────────────────────────────
  async addProductFeature(
    id: string,
    payload: import('./types').CreateProductFeatureRequest
  ): Promise<{ success: boolean; data: import('./types').ProductFeature }> {
    const response = await apiClient.post<{
      success: boolean;
      data: import('./types').ProductFeature;
    }>(`/products/${id}/features`, payload);
    return response.data;
  },

  async updateProductFeature(
    id: string,
    featureId: string,
    payload: import('./types').UpdateProductFeatureRequest
  ): Promise<{ success: boolean; data: import('./types').ProductFeature }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductFeature;
    }>(`/products/${id}/features/${featureId}`, payload);
    return response.data;
  },

  async reorderProductFeatures(
    id: string,
    featureIds: string[]
  ): Promise<{ success: boolean; data: import('./types').ProductFeature[] }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductFeature[];
    }>(`/products/${id}/features/reorder`, { featureIds });
    return response.data;
  },

  async deleteProductFeature(id: string, featureId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/products/${id}/features/${featureId}`
    );
    return response.data;
  },

  // ── Key Benefits ─────────────────────────────────────────────────────────
  async addProductKeyBenefit(
    id: string,
    payload: import('./types').CreateProductKeyBenefitRequest
  ): Promise<{ success: boolean; data: import('./types').ProductKeyBenefit }> {
    const response = await apiClient.post<{
      success: boolean;
      data: import('./types').ProductKeyBenefit;
    }>(`/products/${id}/key-benefits`, payload);
    return response.data;
  },

  async updateProductKeyBenefit(
    id: string,
    benefitId: string,
    payload: import('./types').UpdateProductKeyBenefitRequest
  ): Promise<{ success: boolean; data: import('./types').ProductKeyBenefit }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductKeyBenefit;
    }>(`/products/${id}/key-benefits/${benefitId}`, payload);
    return response.data;
  },

  async reorderProductKeyBenefits(
    id: string,
    benefitIds: string[]
  ): Promise<{ success: boolean; data: import('./types').ProductKeyBenefit[] }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductKeyBenefit[];
    }>(`/products/${id}/key-benefits/reorder`, { benefitIds });
    return response.data;
  },

  async deleteProductKeyBenefit(id: string, benefitId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/products/${id}/key-benefits/${benefitId}`
    );
    return response.data;
  },

  // ── Related Products ─────────────────────────────────────────────────────
  async setRelatedProducts(
    id: string,
    relatedProductIds: string[]
  ): Promise<{ success: boolean; data: Product }> {
    const response = await apiClient.put<{ success: boolean; data: Product }>(
      `/products/${id}/related-products`,
      { relatedProductIds }
    );
    return response.data;
  },

  // ── Product Gallery ──────────────────────────────────────────────────────
  async uploadProductGallery(
    id: string,
    files: File[]
  ): Promise<{ success: boolean; data: import('./types').ProductGalleryImage[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await apiClient.post<{
      success: boolean;
      data: import('./types').ProductGalleryImage[];
    }>(`/products/${id}/gallery`, formData);
    return response.data;
  },

  async reorderProductGallery(
    id: string,
    imageIds: string[]
  ): Promise<{ success: boolean; data: import('./types').ProductGalleryImage[] }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductGalleryImage[];
    }>(`/products/${id}/gallery/reorder`, { imageIds });
    return response.data;
  },

  async setProductPrimaryImage(
    id: string,
    galleryImageId: string
  ): Promise<{ success: boolean; data: import('./types').ProductGalleryImage }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductGalleryImage;
    }>(`/products/${id}/gallery/${galleryImageId}/primary`);
    return response.data;
  },

  async deleteProductGalleryImage(
    id: string,
    galleryImageId: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/products/${id}/gallery/${galleryImageId}`
    );
    return response.data;
  },

  // ── Product Videos ───────────────────────────────────────────────────────
  async uploadProductVideos(
    id: string,
    files: File[],
    title?: string
  ): Promise<{ success: boolean; data: import('./types').ProductVideo[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('videos', file);
    });
    if (title) {
      formData.append('title', title);
    }
    const response = await apiClient.post<{
      success: boolean;
      data: import('./types').ProductVideo[];
    }>(`/products/${id}/videos`, formData);
    return response.data;
  },

  async updateProductVideo(
    id: string,
    videoId: string,
    payload: import('./types').UpdateProductVideoRequest
  ): Promise<{ success: boolean; data: import('./types').ProductVideo }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductVideo;
    }>(`/products/${id}/videos/${videoId}`, payload);
    return response.data;
  },

  async reorderProductVideos(
    id: string,
    videoIds: string[]
  ): Promise<{ success: boolean; data: import('./types').ProductVideo[] }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductVideo[];
    }>(`/products/${id}/videos/reorder`, { videoIds });
    return response.data;
  },

  async deleteProductVideo(id: string, videoId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/products/${id}/videos/${videoId}`
    );
    return response.data;
  },

  // ── Product Documents ────────────────────────────────────────────────────
  async uploadProductDocuments(
    id: string,
    files: File[],
    title?: string
  ): Promise<{ success: boolean; data: import('./types').ProductDocument[] }> {
    const formData = new FormData();
    if (title && title.trim()) {
      formData.append('title', title.trim().slice(0, 200));
    }
    files.forEach((file) => {
      formData.append('documents', file);
    });
    const response = await apiClient.post<{
      success: boolean;
      data: import('./types').ProductDocument[];
    }>(`/products/${id}/documents`, formData);
    return response.data;
  },

  async updateProductDocument(
    id: string,
    documentId: string,
    payload: import('./types').UpdateProductDocumentRequest
  ): Promise<{ success: boolean; data: import('./types').ProductDocument }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductDocument;
    }>(`/products/${id}/documents/${documentId}`, payload);
    return response.data;
  },

  async reorderProductDocuments(
    id: string,
    documentIds: string[]
  ): Promise<{ success: boolean; data: import('./types').ProductDocument[] }> {
    const response = await apiClient.patch<{
      success: boolean;
      data: import('./types').ProductDocument[];
    }>(`/products/${id}/documents/reorder`, { documentIds });
    return response.data;
  },

  async deleteProductDocument(id: string, documentId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/products/${id}/documents/${documentId}`
    );
    return response.data;
  },
};

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
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsService } from './products.service';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('productsService subresource operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Features
  it('adds product feature via POST /products/:id/features', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, data: { id: 'feat-1', title: 'Energy Efficient' } },
    });

    const result = await productsService.addProductFeature('prod-1', {
      icon: 'zap',
      title: 'Energy Efficient',
      description: 'Uses 50% less power',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/products/prod-1/features', {
      icon: 'zap',
      title: 'Energy Efficient',
      description: 'Uses 50% less power',
    });
    expect(result.data.title).toBe('Energy Efficient');
  });

  it('reorders features via PATCH /products/:id/features/reorder', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, message: 'Reordered' },
    });

    await productsService.reorderProductFeatures('prod-1', ['feat-2', 'feat-1']);
    expect(apiClient.patch).toHaveBeenCalledWith('/products/prod-1/features/reorder', {
      featureIds: ['feat-2', 'feat-1'],
    });
  });

  // Key Benefits
  it('adds key benefit via POST /products/:id/key-benefits', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, data: { id: 'ben-1', title: 'Durable', description: 'Long lasting' } },
    });

    const result = await productsService.addProductKeyBenefit('prod-1', {
      icon: 'shield',
      title: 'Durable',
      description: 'Long lasting',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/products/prod-1/key-benefits', {
      icon: 'shield',
      title: 'Durable',
      description: 'Long lasting',
    });
    expect(result.data.title).toBe('Durable');
  });

  // Related Products
  it('sets related products via PUT /products/:id/related-products', async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { success: true, data: [] },
    });

    await productsService.setRelatedProducts('prod-1', ['prod-2', 'prod-3']);
    expect(apiClient.put).toHaveBeenCalledWith('/products/prod-1/related-products', {
      relatedProductIds: ['prod-2', 'prod-3'],
    });
  });

  // Gallery
  it('sets primary gallery image via PATCH /products/:id/gallery/:galleryId/primary', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, data: { id: 'img-1', isPrimary: true } },
    });

    const result = await productsService.setProductPrimaryImage('prod-1', 'img-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/products/prod-1/gallery/img-1/primary');
    expect(result.data.isPrimary).toBe(true);
  });

  // Videos
  it('updates video metadata via PATCH /products/:id/videos/:videoId', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, data: { id: 'vid-1', title: 'New Demo Video' } },
    });

    const result = await productsService.updateProductVideo('prod-1', 'vid-1', {
      title: 'New Demo Video',
    });
    expect(apiClient.patch).toHaveBeenCalledWith('/products/prod-1/videos/vid-1', {
      title: 'New Demo Video',
    });
    expect(result.data.title).toBe('New Demo Video');
  });

  // Documents
  it('deletes document via DELETE /products/:id/documents/:documentId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Deleted' },
    });

    await productsService.deleteProductDocument('prod-1', 'doc-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/products/prod-1/documents/doc-1');
  });
});

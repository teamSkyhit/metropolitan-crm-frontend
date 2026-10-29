import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoriesService } from './categories.service';
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

describe('categoriesService media operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads category thumbnail image to PUT /categories/:id/image with formData', async () => {
    const mockFile = new File(['dummy'], 'thumb.png', { type: 'image/png' });
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { success: true, data: { id: 'cat-1', imageUrl: 'https://example.com/thumb.png' } },
    });

    const result = await categoriesService.uploadImage('cat-1', mockFile);
    expect(apiClient.put).toHaveBeenCalledWith('/categories/cat-1/image', expect.any(FormData));
    expect(result.imageUrl).toBe('https://example.com/thumb.png');
  });

  it('deletes category thumbnail image via DELETE /categories/:id/image', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, data: { id: 'cat-1', imageUrl: null } },
    });

    const result = await categoriesService.deleteImage('cat-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/categories/cat-1/image');
    expect(result.imageUrl).toBeNull();
  });

  it('uploads category banner to PUT /categories/:id/banner with formData', async () => {
    const mockFile = new File(['dummy'], 'banner.png', { type: 'image/png' });
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { success: true, data: { id: 'cat-1', bannerUrl: 'https://example.com/banner.png' } },
    });

    const result = await categoriesService.uploadBanner('cat-1', mockFile);
    expect(apiClient.put).toHaveBeenCalledWith('/categories/cat-1/banner', expect.any(FormData));
    expect(result.bannerUrl).toBe('https://example.com/banner.png');
  });

  it('deletes category banner via DELETE /categories/:id/banner', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, data: { id: 'cat-1', bannerUrl: null } },
    });

    const result = await categoriesService.deleteBanner('cat-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/categories/cat-1/banner');
    expect(result.bannerUrl).toBeNull();
  });

  it('reorders categories via PATCH /categories/reorder', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { success: true } });

    await categoriesService.reorderCategories(['cat-2', 'cat-1']);
    expect(apiClient.patch).toHaveBeenCalledWith('/categories/reorder', {
      categoryIds: ['cat-2', 'cat-1'],
    });
  });
});

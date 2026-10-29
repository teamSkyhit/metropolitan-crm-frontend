import { describe, it, expect, vi, beforeEach } from 'vitest';
import { industrialCapabilitiesService } from './industrial-capabilities.service';
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

describe('industrialCapabilitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches list of capabilities via GET /industrial-capabilities', async () => {
    const mockResponse = {
      success: true,
      data: [{ id: 'cap-1', title: 'Precision Gears', slug: 'gears' }],
      meta: {
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

    const result = await industrialCapabilitiesService.getCapabilities({ search: 'gears' });
    expect(apiClient.get).toHaveBeenCalledWith('/industrial-capabilities', {
      params: { search: 'gears' },
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Precision Gears');
  });

  it('fetches single capability via GET /industrial-capabilities/:id', async () => {
    const mockCap = { id: 'cap-1', title: 'Precision Gears', slug: 'gears' };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: mockCap } });

    const result = await industrialCapabilitiesService.getCapability('cap-1');
    expect(apiClient.get).toHaveBeenCalledWith('/industrial-capabilities/cap-1');
    expect(result.id).toBe('cap-1');
  });

  it('creates capability via POST /industrial-capabilities', async () => {
    const payload = {
      title: 'Heavy Machining',
      slug: 'heavy-machining',
      typicalProducts: ['Turbine Shafts'],
    };
    const mockCreated = { id: 'cap-2', ...payload, sortOrder: 0, isActive: true };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await industrialCapabilitiesService.createCapability(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/industrial-capabilities', payload);
    expect(result.id).toBe('cap-2');
  });

  it('updates capability via PATCH /industrial-capabilities/:id', async () => {
    const payload = { title: 'Advanced Heavy Machining' };
    const mockUpdated = { id: 'cap-2', title: 'Advanced Heavy Machining' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, data: mockUpdated },
    });

    const result = await industrialCapabilitiesService.updateCapability('cap-2', payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/industrial-capabilities/cap-2', payload);
    expect(result.title).toBe('Advanced Heavy Machining');
  });

  it('deletes capability via DELETE /industrial-capabilities/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null });

    await industrialCapabilitiesService.deleteCapability('cap-2');
    expect(apiClient.delete).toHaveBeenCalledWith('/industrial-capabilities/cap-2');
  });

  it('restores capability via POST /industrial-capabilities/:id/restore', async () => {
    const mockRestored = { id: 'cap-2', title: 'Heavy Machining' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, data: mockRestored },
    });

    const result = await industrialCapabilitiesService.restoreCapability('cap-2');
    expect(apiClient.post).toHaveBeenCalledWith('/industrial-capabilities/cap-2/restore');
    expect(result.id).toBe('cap-2');
  });

  it('reorders capabilities via PATCH /industrial-capabilities/reorder', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { success: true } });

    await industrialCapabilitiesService.reorderCapabilities(['cap-2', 'cap-1']);
    expect(apiClient.patch).toHaveBeenCalledWith('/industrial-capabilities/reorder', {
      capabilityIds: ['cap-2', 'cap-1'],
    });
  });

  it('uploads capability image via PUT /industrial-capabilities/:id/image with multipart FormData', async () => {
    const mockFile = new File(['dummy'], 'cap.jpg', { type: 'image/jpeg' });
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { success: true, data: { id: 'cap-1', imageUrl: 'https://example.com/cap.jpg' } },
    });

    const result = await industrialCapabilitiesService.uploadImage('cap-1', mockFile);
    expect(apiClient.put).toHaveBeenCalledWith(
      '/industrial-capabilities/cap-1/image',
      expect.any(FormData)
    );
    expect(result.imageUrl).toBe('https://example.com/cap.jpg');
  });

  it('removes capability image via DELETE /industrial-capabilities/:id/image', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, data: { id: 'cap-1', imageUrl: null } },
    });

    const result = await industrialCapabilitiesService.deleteImage('cap-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/industrial-capabilities/cap-1/image');
    expect(result.imageUrl).toBeNull();
  });

  it('gets section settings via GET /industrial-capabilities/settings', async () => {
    const mockSettings = {
      eyebrow: 'OUR INDUSTRIAL CAPABILITIES',
      title: 'SIX CORE SEGMENTS',
      description: 'Overview of capabilities',
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockSettings },
    });

    const result = await industrialCapabilitiesService.getSectionSettings();
    expect(apiClient.get).toHaveBeenCalledWith('/industrial-capabilities/settings');
    expect(result.title).toBe('SIX CORE SEGMENTS');
  });

  it('updates section settings via PATCH /industrial-capabilities/settings', async () => {
    const payload = { title: 'EIGHT CORE SEGMENTS' };
    const mockUpdated = {
      eyebrow: 'OUR INDUSTRIAL CAPABILITIES',
      title: 'EIGHT CORE SEGMENTS',
      description: 'Overview',
    };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, data: mockUpdated },
    });

    const result = await industrialCapabilitiesService.updateSectionSettings(payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/industrial-capabilities/settings', payload);
    expect(result.title).toBe('EIGHT CORE SEGMENTS');
  });
});

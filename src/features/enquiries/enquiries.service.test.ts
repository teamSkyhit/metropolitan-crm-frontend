/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enquiriesService } from './enquiries.service';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('enquiriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches enquiries with query parameters', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [{ id: 'enq-1', name: 'John Doe', status: 'NEW' }],
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
      },
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse as any);

    const query = { page: 1, limit: 20, status: 'NEW' as const };
    const result = await enquiriesService.getEnquiries(query);

    expect(apiClient.get).toHaveBeenCalledWith('/enquiries', { params: query });
    expect(result.data).toHaveLength(1);
  });

  it('fetches an enquiry by id', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { id: 'enq-1', name: 'John Doe', status: 'NEW' },
      },
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse as any);

    const result = await enquiriesService.getEnquiryById('enq-1');

    expect(apiClient.get).toHaveBeenCalledWith('/enquiries/enq-1');
    expect(result.data.id).toBe('enq-1');
  });

  it('calls POST /enquiries/:id/status when updating enquiry status', async () => {
    const payload = { status: 'CONTACTED' as const, note: 'Spoke with client' };
    const mockResponse = {
      data: {
        success: true,
        data: { id: 'enq-1', status: 'CONTACTED' },
      },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any);

    const result = await enquiriesService.updateStatus('enq-1', payload);

    expect(apiClient.post).toHaveBeenCalledWith('/enquiries/enq-1/status', payload);
    expect(result.data.status).toBe('CONTACTED');
  });

  it('calls PUT /enquiries/:id/assignee when assigning enquiry', async () => {
    const payload = { assignedToId: 'user-1' };
    const mockResponse = {
      data: {
        success: true,
        data: { id: 'enq-1', assignedTo: { id: 'user-1', name: 'Devaki' } },
      },
    };
    vi.mocked(apiClient.put).mockResolvedValue(mockResponse as any);

    const result = await enquiriesService.assignEnquiry('enq-1', payload);

    expect(apiClient.put).toHaveBeenCalledWith('/enquiries/enq-1/assignee', payload);
    expect(result.data.assignedTo?.id).toBe('user-1');
  });

  it('calls POST /enquiries/:id/follow-ups when adding a follow-up', async () => {
    const payload = {
      note: 'Follow-up call scheduled',
    };
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: 'fu-1',
          note: 'Follow-up call scheduled',
          createdAt: '2026-10-30T10:00:00.000Z',
        },
      },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any);

    const result = await enquiriesService.addFollowUp('enq-1', payload);

    expect(apiClient.post).toHaveBeenCalledWith('/enquiries/enq-1/follow-ups', payload);
    expect(result.data.id).toBe('fu-1');
  });

  it('calls PATCH /enquiries/:id when updating enquiry details/notes', async () => {
    const payload = { salesNotes: 'Updated notes' };
    const mockResponse = {
      data: {
        success: true,
        data: { id: 'enq-1', salesNotes: 'Updated notes' },
      },
    };
    vi.mocked(apiClient.patch).mockResolvedValue(mockResponse as any);

    const result = await enquiriesService.updateNotes('enq-1', payload);

    expect(apiClient.patch).toHaveBeenCalledWith('/enquiries/enq-1', payload);
    expect(result.data.salesNotes).toBe('Updated notes');
  });
});

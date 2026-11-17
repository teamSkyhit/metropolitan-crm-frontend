/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExportEnquiriesModal } from './ExportEnquiriesModal';
import { enquiriesService } from '../enquiries.service';
import * as exportUtils from '../utils/exportEnquiries';
import toast from 'react-hot-toast';

vi.mock('../enquiries.service', () => ({
  enquiriesService: {
    getEnquiries: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ExportEnquiriesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('renders modal when open with default preset', () => {
    render(<ExportEnquiriesModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Export Enquiries Sheet')).toBeDefined();
    expect(screen.getByText('This Month')).toBeDefined();
    expect(screen.getByText('Last Month')).toBeDefined();
    expect(screen.getByText('All Enquiries')).toBeDefined();
    expect(screen.getByText('Custom Dates')).toBeDefined();
    expect(screen.getByRole('button', { name: /Download Sheet/i })).toBeDefined();
  });

  it('updates dates when presets are clicked', () => {
    render(<ExportEnquiriesModal isOpen={true} onClose={() => {}} />);

    const allBtn = screen.getByText('All Enquiries');
    fireEvent.click(allBtn);

    const fromInput = screen.getByLabelText(/Export From Date/i) as HTMLInputElement;
    const toInput = screen.getByLabelText(/Export To Date/i) as HTMLInputElement;

    expect(fromInput.value).toBe('');
    expect(toInput.value).toBe('');

    const thisMonthBtn = screen.getByText('This Month');
    fireEvent.click(thisMonthBtn);
    expect(fromInput.value).not.toBe('');
    expect(toInput.value).not.toBe('');
  });

  it('fetches enquiries and downloads sheet upon clicking Download Sheet', async () => {
    const downloadSpy = vi.spyOn(exportUtils, 'downloadEnquiriesCsv').mockImplementation(() => {});
    const mockData = [
      {
        id: 'enq-1',
        name: 'Alice',
        company: 'Company A',
        email: 'alice@example.com',
        mobile: '1234567890',
        city: 'City A',
        status: 'NEW' as const,
        assignedTo: null,
        lineItemCount: 1,
        createdAt: '2026-10-30T10:00:00Z',
        updatedAt: '2026-10-30T10:00:00Z',
      },
    ];

    vi.mocked(enquiriesService.getEnquiries).mockResolvedValueOnce({
      success: true,
      data: mockData,
      meta: {
        pagination: {
          page: 1,
          limit: 100,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    } as any);

    const onClose = vi.fn();
    render(<ExportEnquiriesModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Download Sheet/i }));

    await waitFor(() => {
      expect(enquiriesService.getEnquiries).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(mockData, expect.stringContaining('.csv'));
      expect(toast.success).toHaveBeenCalledWith('Successfully exported 1 enquiries!');
      expect(onClose).toHaveBeenCalled();
    });

    downloadSpy.mockRestore();
  });

  it('displays error toast when no enquiries match the export criteria', async () => {
    vi.mocked(enquiriesService.getEnquiries).mockResolvedValueOnce({
      success: true,
      data: [],
      meta: {
        pagination: {
          page: 1,
          limit: 100,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    } as any);

    render(<ExportEnquiriesModal isOpen={true} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Download Sheet/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'No enquiries found for the selected date range or filters.'
      );
    });
  });
});

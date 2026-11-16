/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnquiryItemBadge } from './EnquiryItemBadge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { enquiriesService } from '../enquiries.service';

vi.mock('../enquiries.service', () => ({
  enquiriesService: {
    getEnquiryById: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('EnquiryItemBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('renders "0 items" directly when fallbackCount is 0', () => {
    renderWithClient(<EnquiryItemBadge enquiryId="enq-0" fallbackCount={0} />);
    expect(screen.getByText('0 items')).toBeDefined();
    expect(enquiriesService.getEnquiryById).not.toHaveBeenCalled();
  });

  it('renders multi-item count directly when fallbackCount > 1 without fetching detail', () => {
    renderWithClient(<EnquiryItemBadge enquiryId="enq-2" fallbackCount={3} />);
    expect(screen.getByText('3 items')).toBeDefined();
    expect(enquiriesService.getEnquiryById).not.toHaveBeenCalled();
  });

  it('detects and renders "General Enquiry" for placeholder contact form line items', async () => {
    vi.mocked(enquiriesService.getEnquiryById).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'enq-contact',
        lineItems: [
          {
            id: 'item-1',
            productId: 'general-inquiry',
            sku: 'GENERAL-CONTACT',
            productName: 'General Website Enquiry',
            quantity: 1,
          },
        ],
      },
    } as any);

    renderWithClient(<EnquiryItemBadge enquiryId="enq-contact" fallbackCount={1} />);

    await waitFor(() => {
      expect(screen.getByText('General Enquiry')).toBeDefined();
    });
  });

  it('renders "1 item" when detail has a real single product', async () => {
    vi.mocked(enquiriesService.getEnquiryById).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'enq-real',
        lineItems: [
          {
            id: 'item-2',
            productId: 'prod-123',
            sku: 'GEARBOX-50',
            productName: 'Epicyclic Gearbox',
            quantity: 1,
          },
        ],
      },
    } as any);

    renderWithClient(<EnquiryItemBadge enquiryId="enq-real" fallbackCount={1} />);

    await waitFor(() => {
      expect(screen.getByText('1 item')).toBeDefined();
    });
  });
});

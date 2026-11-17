import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductForm } from './ProductForm';
import { ProductSpecificationsEditor } from './ProductSpecificationsEditor';
import { ProductKeyBenefitsEditor } from './ProductKeyBenefitsEditor';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderWithClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

vi.mock('@/features/brands/hooks/useBrands', () => ({
  useBrands: () => ({
    data: {
      data: [
        {
          id: 'brand-bonfiglioli',
          name: 'Bonfiglioli',
          logoUrl: 'https://example.com/bonfiglioli.png',
        },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/features/categories/hooks/useCategories', () => ({
  useCategories: () => ({
    data: {
      data: [{ id: 'cat-gearboxes', name: 'Industrial Gearboxes' }],
    },
    isLoading: false,
  }),
}));

vi.mock('../hooks/useProduct', () => ({
  useUpdateProductSpecifications: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

afterEach(cleanup);

describe('Product CMS Order & Content Structure Alignment', () => {
  it('renders Basic Information, Description, Brand, and Internal SKU in proper logical sections', () => {
    const onSubmit = vi.fn();
    renderWithClient(<ProductForm mode="create" onSubmit={onSubmit} isPending={false} />);

    // Section 1: Basic Product Information
    expect(screen.getByText('1. Basic Product Information')).toBeDefined();
    expect(screen.getByLabelText(/Product Name/)).toBeDefined();
    expect(screen.getByLabelText(/Category/)).toBeDefined();

    // Section 2: Product Description
    expect(screen.getByText('2. Product Description')).toBeDefined();
    expect(
      screen.getByPlaceholderText(/Detailed description with markdown formatting/i)
    ).toBeDefined();

    // Section 3: Brand
    expect(screen.getByText('3. Brand')).toBeDefined();
    expect(screen.getByLabelText(/Brand \*/)).toBeDefined();

    // SKU labeled as Internal Reference & preserved for backend creation
    expect(screen.getByText('Internal Reference & Inventory')).toBeDefined();
    expect(screen.getByLabelText(/SKU \(Internal Reference\)/i)).toBeDefined();

    // Product Overview marked as Currently hidden on website
    expect(screen.getByText('Product Overview (Optional / Inactive)')).toBeDefined();
    expect(screen.getAllByText('Currently hidden on website').length).toBeGreaterThan(0);
  });

  it('includes description in submission payload', () => {
    const onSubmit = vi.fn();
    renderWithClient(<ProductForm mode="create" onSubmit={onSubmit} isPending={false} />);

    fireEvent.change(screen.getByLabelText(/Product Name/), {
      target: { value: 'Helical Reducer' },
    });
    fireEvent.change(screen.getByLabelText(/SKU \(Internal Reference\)/i), {
      target: { value: 'HLR-200' },
    });
    fireEvent.change(screen.getByLabelText(/Brand \*/), {
      target: { value: 'brand-bonfiglioli' },
    });
    fireEvent.change(screen.getByLabelText(/Category/), {
      target: { value: 'cat-gearboxes' },
    });

    const descTextarea = screen.getByPlaceholderText(
      /Detailed description with markdown formatting/i
    );
    fireEvent.change(descTextarea, {
      target: { value: 'Heavy-duty industrial gearbox engineered for mining.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Helical Reducer',
        sku: 'HLR-200',
        brandId: 'brand-bonfiglioli',
        categoryId: 'cat-gearboxes',
        description: 'Heavy-duty industrial gearbox engineered for mining.',
      })
    );
  });

  it('renders Technical Specifications with explicit Optional badge', () => {
    renderWithClient(<ProductSpecificationsEditor value={[]} onChange={vi.fn()} />);

    expect(screen.getByText('5. Technical Specifications')).toBeDefined();
    expect(screen.getByText('Optional')).toBeDefined();
  });

  it('renders Key Benefits editor marked with Currently hidden on website badge and message', () => {
    renderWithClient(<ProductKeyBenefitsEditor benefits={[]} onChange={vi.fn()} />);

    expect(screen.getByText('Key Benefits (Optional / Inactive)')).toBeDefined();
    expect(screen.getAllByText(/Currently hidden on website/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole('switch', { name: /Toggle Key Benefits Website Visibility/i })
    ).toBeNull();
  });

  it('marks SKU and Product Overview as inactive on website without false toggle switches', () => {
    renderWithClient(<ProductForm mode="create" onSubmit={vi.fn()} isPending={false} />);

    // SKU
    expect(screen.getAllByText(/Internal Reference Only/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hidden on Website/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('switch', { name: /Toggle SKU Website Visibility/i })).toBeNull();

    // Product Overview
    expect(screen.getByText('Product Overview (Optional / Inactive)')).toBeDefined();
    expect(screen.getAllByText(/Currently hidden on website/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole('switch', { name: /Toggle Product Overview Website Visibility/i })
    ).toBeNull();
  });
});

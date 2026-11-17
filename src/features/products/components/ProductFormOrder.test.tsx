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

    // Product Overview marked as Optional
    expect(screen.getByText('Product Overview (Optional)')).toBeDefined();
    expect(screen.getAllByText(/Hidden on Website/i).length).toBeGreaterThan(0);
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

  it('dynamically displays Visible on Website when Key Benefits exist and Hidden on Website when empty', () => {
    // Empty state
    const { unmount } = renderWithClient(
      <ProductKeyBenefitsEditor benefits={[]} onChange={vi.fn()} />
    );
    expect(screen.getByText('Key Benefits (Optional)')).toBeDefined();
    expect(screen.getAllByText(/Hidden on Website/i).length).toBeGreaterThan(0);
    unmount();

    // With benefits added
    renderWithClient(
      <ProductKeyBenefitsEditor
        benefits={[
          { id: 'b1', icon: 'shield', title: 'Quality', description: 'Certified', sortOrder: 0 },
        ]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getAllByText(/Visible on Website/i).length).toBeGreaterThan(0);
  });

  it('dynamically displays Visible on Website when SKU and Overview have data, and Hidden on Website when empty', () => {
    // Empty state (create mode with no initial data)
    const { unmount } = renderWithClient(
      <ProductForm mode="create" onSubmit={vi.fn()} isPending={false} />
    );
    expect(screen.getAllByText(/Hidden on Website/i).length).toBeGreaterThan(0);
    unmount();

    // Populated state (edit mode with SKU and overview data)
    renderWithClient(
      <ProductForm
        mode="edit"
        initialData={{
          name: 'Test Product',
          sku: 'TEST-SKU-100',
          overview: 'Comprehensive technical overview text.',
          brandId: 'b1',
          categoryId: 'c1',
        }}
        onSubmit={vi.fn()}
        isPending={false}
      />
    );

    expect(screen.getAllByText(/Visible on Website/i).length).toBeGreaterThan(0);
  });
});

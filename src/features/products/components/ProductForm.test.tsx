import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductForm } from './ProductForm';

vi.mock('@/features/brands/hooks/useBrands', () => ({
  useBrands: () => ({
    data: { data: [{ id: 'brand-1', name: 'Bonfiglioli' }] },
    isLoading: false,
  }),
}));

vi.mock('@/features/categories/hooks/useCategories', () => ({
  useCategories: () => ({
    data: { data: [{ id: 'category-1', name: 'Gearboxes' }] },
    isLoading: false,
  }),
}));

afterEach(cleanup);

describe('ProductForm', () => {
  it('shows clear inline errors when required fields are missing', () => {
    const onSubmit = vi.fn();
    render(<ProductForm mode="create" onSubmit={onSubmit} isPending={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    expect(screen.getByText('Enter a product name.')).toBeTruthy();
    expect(screen.getByText('Enter a unique SKU.')).toBeTruthy();
    expect(screen.getByText('Select a brand.')).toBeTruthy();
    expect(screen.getByText('Select a category.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects invalid pricing and non-http canonical URLs', () => {
    const onSubmit = vi.fn();
    render(<ProductForm mode="create" onSubmit={onSubmit} isPending={false} />);

    fireEvent.change(screen.getByLabelText(/Product Name/), {
      target: { value: 'Industrial Gearbox' },
    });
    fireEvent.change(screen.getByLabelText(/^SKU/), { target: { value: 'GBX-100' } });
    fireEvent.change(screen.getByLabelText(/Brand/), { target: { value: 'brand-1' } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'category-1' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '-1' } });
    fireEvent.change(screen.getByLabelText(/Canonical URL/), {
      target: { value: 'ftp://example.com/product' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    expect(screen.getByText('Enter a valid price of 0 or more.')).toBeTruthy();
    expect(screen.getByText('Canonical URL must start with http:// or https://.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits normalized product data when the form is valid', () => {
    const onSubmit = vi.fn();
    render(<ProductForm mode="create" onSubmit={onSubmit} isPending={false} />);

    fireEvent.change(screen.getByLabelText(/Product Name/), {
      target: { value: '  Industrial Gearbox  ' },
    });
    fireEvent.change(screen.getByLabelText(/^SKU/), { target: { value: '  GBX-100  ' } });
    fireEvent.change(screen.getByLabelText(/Brand/), { target: { value: 'brand-1' } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'category-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Industrial Gearbox',
        sku: 'GBX-100',
        brandId: 'brand-1',
        categoryId: 'category-1',
      })
    );
  });
});

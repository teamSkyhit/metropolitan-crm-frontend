import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, vi, afterEach } from 'vitest';
import { ProductSeoSettings } from './ProductSeoSettings';

afterEach(cleanup);

test('renders SEO fields with initial values and character counters', () => {
  const seo = {
    metaTitle: 'Sample Title',
    metaDescription: 'Sample Description',
    metaKeywords: 'apple, tech',
    canonicalUrl: 'https://example.com/item',
    ogImageUrl: 'https://example.com/image.png',
  };
  const onChange = vi.fn();

  render(<ProductSeoSettings seo={seo} onChange={onChange} />);

  expect(screen.getByDisplayValue('Sample Title')).toBeDefined();
  expect(screen.getByDisplayValue('Sample Description')).toBeDefined();
  expect(screen.getByDisplayValue('apple, tech')).toBeDefined();
  expect(screen.getByDisplayValue('https://example.com/item')).toBeDefined();
  expect(screen.getByDisplayValue('https://example.com/image.png')).toBeDefined();
  // Check that character counter is rendered (e.g. 12 / 60)
  expect(screen.getByText(/12 \/ 60/)).toBeDefined();
});

test('calls onChange when SEO input values change', () => {
  const seo = {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogImageUrl: '',
  };
  const onChange = vi.fn();

  render(<ProductSeoSettings seo={seo} onChange={onChange} />);

  const titleInput = screen.getByPlaceholderText(/Bonfiglioli HDO Series/i);
  fireEvent.change(titleInput, { target: { value: 'New SEO Title' } });

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({
      metaTitle: 'New SEO Title',
    })
  );
});

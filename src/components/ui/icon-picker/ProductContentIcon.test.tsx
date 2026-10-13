import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { expect, test, afterEach } from 'vitest';
import { ProductContentIcon } from './ProductContentIcon';

afterEach(cleanup);

test('renders mapped Lucide icon by key', () => {
  const { container } = render(<ProductContentIcon icon="zap" size={24} />);
  const svg = container.querySelector('svg');
  expect(svg).toBeDefined();
});

test('renders safe img tag when icon is an HTTPS URL', () => {
  render(<ProductContentIcon icon="https://example.com/icon.svg" size={20} />);
  const img = screen.getByRole('img');
  expect(img).toBeDefined();
  expect(img.getAttribute('src')).toBe('https://example.com/icon.svg');
});

test('renders fallback HelpCircle icon when icon key is unknown', () => {
  const { container } = render(<ProductContentIcon icon="non-existent-icon" size={16} />);
  const svg = container.querySelector('svg');
  expect(svg).toBeDefined();
  expect(screen.getByTitle('Icon: non-existent-icon')).toBeDefined();
});

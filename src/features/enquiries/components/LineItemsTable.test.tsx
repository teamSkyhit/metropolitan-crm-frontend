import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { expect, test, afterEach } from 'vitest';
import { LineItemsTable } from './LineItemsTable';
import { EnquiryLineItem } from '../types';

afterEach(cleanup);

test('renders General Website Enquiry card when items are general contact form submissions', () => {
  const generalItems: EnquiryLineItem[] = [
    {
      id: 'item-1',
      productId: 'general-inquiry',
      sku: 'GENERAL-CONTACT',
      productName: 'General Website Enquiry',
      quantity: 1,
    },
  ];

  render(<LineItemsTable items={generalItems} />);

  expect(screen.getByText('General Website Enquiry')).toBeDefined();
  expect(
    screen.getByText(/contact form submission · no specific products requested/i)
  ).toBeDefined();
  expect(screen.queryByText('Requested Products')).toBeNull();
  expect(screen.queryByText('GENERAL-CONTACT')).toBeNull();
});

test('renders Requested Products table when real products are requested', () => {
  const productItems: EnquiryLineItem[] = [
    {
      id: 'item-2',
      productId: 'p-1',
      sku: 'GEAR-100',
      productName: 'Epicyclic Gearbox',
      quantity: 3,
    },
  ];

  render(<LineItemsTable items={productItems} />);

  expect(screen.getByText('Requested Products')).toBeDefined();
  expect(screen.getAllByText('GEAR-100').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Epicyclic Gearbox').length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText('3 Units')).toBeDefined();
});

test('renders empty state when no items are provided', () => {
  render(<LineItemsTable items={[]} />);

  expect(screen.getByText('Requested Products')).toBeDefined();
  expect(
    screen.getByText('No specific quote line items were specified for this enquiry.')
  ).toBeDefined();
});

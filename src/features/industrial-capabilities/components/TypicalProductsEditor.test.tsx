import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TypicalProductsEditor } from './TypicalProductsEditor';

afterEach(cleanup);

describe('TypicalProductsEditor', () => {
  it('renders existing typical products', () => {
    const products = ['Gears', 'Shafts'];
    render(<TypicalProductsEditor products={products} onChange={vi.fn()} />);

    expect(screen.getByText('Gears')).toBeDefined();
    expect(screen.getByText('Shafts')).toBeDefined();
    expect(screen.getByText('2 of 50 products added.')).toBeDefined();
  });

  it('adds a new product on button click', () => {
    const onChange = vi.fn();
    render(<TypicalProductsEditor products={['Gears']} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/press Enter/i);
    fireEvent.change(input, { target: { value: 'Turbines' } });

    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(['Gears', 'Turbines']);
  });

  it('prevents adding duplicate products', () => {
    const onChange = vi.fn();
    render(<TypicalProductsEditor products={['Gears']} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/press Enter/i);
    fireEvent.change(input, { target: { value: 'gears' } });

    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/"gears" is already added/i)).toBeDefined();
  });

  it('removes a product when the remove button is clicked', () => {
    const onChange = vi.fn();
    render(<TypicalProductsEditor products={['Gears', 'Shafts']} onChange={onChange} />);

    const removeButton = screen.getByTitle('Remove Gears');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['Shafts']);
  });
});

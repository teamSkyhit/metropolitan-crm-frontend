'use client';

import React, { useState } from 'react';
import { Plus, X, Package } from 'lucide-react';

interface TypicalProductsEditorProps {
  products: string[];
  onChange: (products: string[]) => void;
  disabled?: boolean;
}

export function TypicalProductsEditor({
  products,
  onChange,
  disabled = false,
}: TypicalProductsEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    setError(null);

    if (!trimmed) {
      setError('Product item cannot be empty');
      return;
    }

    if (trimmed.length > 100) {
      setError('Product item cannot exceed 100 characters');
      return;
    }

    if (products.length >= 50) {
      setError('Cannot add more than 50 typical products');
      return;
    }

    const lower = trimmed.toLowerCase();
    if (products.some((p) => p.toLowerCase() === lower)) {
      setError(`"${trimmed}" is already added`);
      return;
    }

    onChange([...products, trimmed]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(products.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || products.length >= 50}
            placeholder="e.g. Spiral Bevel Gears, Industrial Shafts (press Enter)"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[var(--color-metro-navy)] focus:ring-4 focus:ring-[#102f57]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim() || products.length >= 50}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      {products.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
          <Package className="h-4 w-4 text-slate-400" />
          <span>
            No typical products added yet. Add sample items manufactured in this capability.
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {products.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-2 text-xs font-medium text-slate-800 shadow-2xs"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded-lg p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                  title={`Remove ${item}`}
                  aria-label={`Remove ${item}`}
                >
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-400">{products.length} of 50 products added.</p>
    </div>
  );
}

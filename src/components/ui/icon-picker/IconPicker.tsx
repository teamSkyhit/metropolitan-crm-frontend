'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProductContentIcon, AVAILABLE_ICON_KEYS } from './ProductContentIcon';
import { Search, ChevronDown, X, Ban } from 'lucide-react';

interface IconPickerProps {
  value?: string | null;
  onChange: (key: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
}

export function IconPicker({
  value = '',
  onChange,
  disabled = false,
  allowClear = true,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeValue = value || '';

  const filteredIcons = AVAILABLE_ICON_KEYS.filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectIcon = (key: string) => {
    // Sanitize: reject scripts/html tags
    if (key.includes('<') || key.includes('>') || key.toLowerCase().includes('javascript:')) {
      return;
    }
    onChange(key);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative inline-block w-full max-w-xs" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-xs transition hover:bg-slate-50 focus:border-[var(--color-metro-navy)] focus:outline-none focus:ring-4 focus:ring-[#102f57]/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5 truncate">
            {safeValue ? (
              <ProductContentIcon
                icon={safeValue}
                className="h-5 w-5 shrink-0 text-[var(--color-metro-navy)]"
              />
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400">
                <Ban size={13} />
              </span>
            )}
            <span className="truncate font-medium text-slate-800 capitalize">
              {safeValue || 'Select icon (optional)'}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {allowClear && safeValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-red-500 shadow-xs"
            title="Clear icon"
            aria-label="Clear selected icon"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-8 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-metro-navy)] focus:bg-white focus:ring-2 focus:ring-[#102f57]/10"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Option */}
          {allowClear && safeValue && (
            <button
              type="button"
              onClick={handleClear}
              className="mb-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Remove selected icon
            </button>
          )}

          {/* Icon Grid */}
          <div className="grid max-h-52 grid-cols-4 gap-1.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
            {filteredIcons.map((key) => {
              const isSelected = safeValue.toLowerCase() === key.toLowerCase();
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectIcon(key)}
                  className={`group flex flex-col items-center justify-center rounded-xl p-2 text-center transition-all ${
                    isSelected
                      ? 'border border-[var(--color-metro-navy)] bg-white shadow-xs ring-1 ring-[var(--color-metro-navy)]'
                      : 'border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xs'
                  }`}
                  title={key}
                >
                  <ProductContentIcon
                    icon={key}
                    className="h-5 w-5 text-slate-700 transition-transform group-hover:scale-110"
                  />
                  <span className="mt-1 w-full truncate text-[10px] font-medium text-slate-600 capitalize">
                    {key}
                  </span>
                </button>
              );
            })}

            {filteredIcons.length === 0 && (
              <div className="col-span-4 py-4 text-center text-xs text-slate-500">
                {searchTerm.startsWith('https://') || searchTerm.startsWith('/') ? (
                  <button
                    type="button"
                    onClick={() => handleSelectIcon(searchTerm.trim())}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Use custom HTTPS URL
                  </button>
                ) : (
                  <span>No matching icons found</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

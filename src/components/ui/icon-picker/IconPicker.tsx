'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProductContentIcon, AVAILABLE_ICON_KEYS } from './ProductContentIcon';
import { Search, ChevronDown, X } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled = false }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative inline-block w-full max-w-xs" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0b2e59] focus:border-[#0b2e59] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          <ProductContentIcon
            icon={value || 'gear'}
            className="w-5 h-5 text-gray-700 flex-shrink-0"
          />
          <span className="font-medium text-gray-800 capitalize truncate">
            {value || 'Select icon'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-72 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 left-0 top-full">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons or paste URL..."
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0b2e59] focus:border-[#0b2e59]"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Icon Grid */}
          <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1.5 p-1 border rounded bg-gray-50">
            {filteredIcons.map((key) => {
              const isSelected = value.toLowerCase() === key.toLowerCase();
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded hover:bg-white hover:shadow-sm border transition-all text-center group ${
                    isSelected
                      ? 'bg-white border-[#0b2e59] ring-1 ring-[#0b2e59]'
                      : 'border-transparent'
                  }`}
                  title={key}
                >
                  <ProductContentIcon
                    icon={key}
                    className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] text-gray-600 mt-1 capitalize truncate w-full">
                    {key}
                  </span>
                </button>
              );
            })}

            {filteredIcons.length === 0 && (
              <div className="col-span-4 py-4 text-center text-xs text-gray-500">
                {searchTerm.startsWith('https://') || searchTerm.startsWith('/') ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(searchTerm.trim());
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                  >
                    Use custom URL: {searchTerm.slice(0, 20)}...
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

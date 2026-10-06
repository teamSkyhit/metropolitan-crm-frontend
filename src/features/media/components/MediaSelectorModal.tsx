/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { useMedia, useUploadMedia } from '../hooks/useMedia';
import { Media } from '../types';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
}

export function MediaSelectorModal({ isOpen, onClose, onSelect }: MediaSelectorModalProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMedia({ page, limit: 20 });
  const uploadMutation = useUploadMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadMutation.mutateAsync(file);
      } catch (error) {
        console.error('Failed to upload media', error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Media">
      <div className="flex flex-col space-y-4 h-[60vh]">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Media Library</h2>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              Failed to load media.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
              <p>No media found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data?.data.map((media) => (
                <div
                  key={media.id}
                  className="relative group cursor-pointer aspect-square rounded-lg border-2 border-transparent hover:border-blue-500 overflow-hidden bg-white shadow-sm"
                  onClick={() => onSelect(media)}
                >
                  <img
                    src={media.thumbnailUrl || media.publicUrl}
                    alt={media.fileName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{media.fileName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination (Simple) */}
        {data?.meta?.pagination && data.meta.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.meta.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.meta.pagination.totalPages}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useState } from 'react';
import { ProductGalleryImage } from '../types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Upload,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductGalleryManagerProps {
  gallery: ProductGalleryImage[];
  onUploadAsync?: (files: File[]) => Promise<void>;
  onReorderAsync?: (imageIds: string[]) => Promise<void>;
  onSetPrimaryAsync?: (galleryImageId: string) => Promise<void>;
  onDeleteAsync?: (galleryImageId: string) => Promise<void>;
  // For Create mode (local state)
  onLocalFilesChange?: (files: File[]) => void;
  localFiles?: File[];
  disabled?: boolean;
}

export function ProductGalleryManager({
  gallery,
  onUploadAsync,
  onReorderAsync,
  onSetPrimaryAsync,
  onDeleteAsync,
  onLocalFilesChange,
  localFiles = [],
  disabled = false,
}: ProductGalleryManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const totalCount = gallery.length + localFiles.length;
  const isFull = totalCount >= 5;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList);

    // Validation: format and size
    for (const f of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`"${f.name}" is not a valid format. Only JPG, PNG, and WebP are allowed.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the 5MB size limit.`);
        return;
      }
    }

    if (totalCount + newFiles.length > 5) {
      toast.error(`Cannot exceed maximum of 5 gallery images. You currently have ${totalCount}.`);
      return;
    }

    if (onUploadAsync) {
      setIsUploading(true);
      try {
        await onUploadAsync(newFiles);
        toast.success(`Uploaded ${newFiles.length} image(s) to gallery.`);
      } catch (err: unknown) {
        const anyErr = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const msg = anyErr?.response?.data?.error?.message || anyErr?.response?.data?.message || '';
        if (anyErr?.response?.status === 404 || msg.includes('Route not found')) {
          toast.error(
            'Product gallery endpoint is not yet supported on this backend. Please use Primary Image above.'
          );
        } else {
          toast.error(msg || 'Failed to upload gallery images.');
        }
      } finally {
        setIsUploading(false);
      }
    } else if (onLocalFilesChange) {
      onLocalFilesChange([...localFiles, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    const reordered = [...gallery];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    if (onReorderAsync) {
      try {
        await onReorderAsync(reordered.map((img) => img.id));
      } catch {
        toast.error('Failed to reorder gallery images.');
      }
    }
  };

  const handleSetPrimary = async (galleryImageId: string) => {
    if (onSetPrimaryAsync) {
      try {
        await onSetPrimaryAsync(galleryImageId);
        toast.success('Set as Primary / Featured image.');
      } catch {
        toast.error('Failed to update primary image.');
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      if (onDeleteAsync) {
        await onDeleteAsync(deleteTargetId);
        toast.success('Image removed from gallery.');
      }
    } catch {
      toast.error('Failed to delete gallery image.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product Gallery</h4>
          <p className="text-xs text-gray-500">
            Upload up to 5 images. JPG, PNG or WebP. Max 5 MB each. The primary image is used as the
            hero thumbnail.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
          {totalCount} of 5 images
        </span>
      </div>

      {/* Upload Zone */}
      {!isFull && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled || isUploading}
          />
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-[#0b2e59] rounded-lg flex flex-col items-center justify-center text-gray-600 bg-gray-50/50 hover:bg-blue-50/30 transition-colors cursor-pointer group"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#0b2e59] animate-spin mb-1" />
                <span className="text-xs text-gray-600">Uploading gallery images...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#0b2e59] mb-1 transition-colors" />
                <span className="text-xs font-medium text-gray-700">
                  Click or drag images to upload
                </span>
                <span className="text-[11px] text-gray-400">
                  JPG, PNG, WebP up to 5MB (Max {5 - totalCount} more)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {gallery.map((img, idx) => (
          <div
            key={img.id}
            className={`relative group rounded-lg overflow-hidden border bg-gray-100 aspect-square shadow-sm ${
              img.isPrimary ? 'border-[#0b2e59] ring-2 ring-[#0b2e59]/30' : 'border-gray-200'
            }`}
          >
            <img src={img.publicUrl} alt="Gallery item" className="w-full h-full object-cover" />

            {/* Badges */}
            {img.isPrimary && (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#0b2e59] text-white text-[10px] font-semibold rounded shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> Primary
              </span>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(img.id)}
                  disabled={disabled}
                  className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-sm"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={disabled || idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className="p-1 bg-white/90 hover:bg-white text-gray-700 rounded disabled:opacity-30"
                    title="Move left"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || idx === gallery.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="p-1 bg-white/90 hover:bg-white text-gray-700 rounded disabled:opacity-30"
                    title="Move right"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {!img.isPrimary && onSetPrimaryAsync && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSetPrimary(img.id)}
                    className="px-2 py-1 bg-white text-[10px] font-medium text-gray-800 rounded hover:bg-gray-100 shadow-sm"
                  >
                    Set Primary
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Local files preview (during Create mode) */}
        {localFiles.map((f, idx) => {
          const previewUrl = URL.createObjectURL(f);
          return (
            <div
              key={`local-${idx}`}
              className="relative group rounded-lg overflow-hidden border border-dashed border-blue-400 bg-blue-50 aspect-square shadow-sm"
            >
              <img
                src={previewUrl}
                alt="New upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] rounded font-medium">
                New
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = [...localFiles];
                  updated.splice(idx, 1);
                  onLocalFilesChange?.(updated);
                }}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded shadow-sm hover:bg-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {totalCount === 0 && (
          <div className="col-span-2 sm:col-span-3 md:col-span-5 p-4 text-center text-xs text-gray-400 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mb-1" />
            <span>No gallery images uploaded yet</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Remove Gallery Image"
        message="Are you sure you want to remove this image from the product gallery?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isDestructive={true}
      />
    </div>
  );
}

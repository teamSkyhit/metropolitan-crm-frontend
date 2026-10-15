/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalCount = gallery.length + localFiles.length;
  const isFull = totalCount >= 5;

  const processFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setValidationError(null);

    // Validation: format and size
    for (const f of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        const message = `"${f.name}" is not supported. Choose a JPG, PNG, or WebP image.`;
        setValidationError(message);
        toast.error(message);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        const message = `"${f.name}" is larger than 5 MB. Choose a smaller image.`;
        setValidationError(message);
        toast.error(message);
        return;
      }
    }

    if (totalCount + newFiles.length > 5) {
      const message = `You can add ${5 - totalCount} more image${5 - totalCount === 1 ? '' : 's'}. Remove extras and try again.`;
      setValidationError(message);
      toast.error(message);
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
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading || isFull) return;
    await processFiles(Array.from(e.dataTransfer.files));
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Product Gallery</h4>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Add clear product angles and detail shots. The primary image appears first to customers.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          {totalCount} of 5 images
        </span>
      </div>

      {validationError && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          role="alert"
        >
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
          <span>{validationError}</span>
        </div>
      )}

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
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={handleDrop}
            aria-describedby="gallery-upload-rules"
            className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              isDragging
                ? 'border-[var(--color-metro-navy)] bg-blue-50 shadow-inner'
                : 'border-gray-300 bg-gray-50/70 hover:border-[var(--color-metro-navy)] hover:bg-blue-50/30'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#0b2e59] animate-spin mb-1" />
                <span className="text-xs text-gray-600">Uploading gallery images...</span>
              </>
            ) : (
              <>
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-transform group-hover:scale-105 group-hover:text-[var(--color-metro-navy)]">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {isDragging ? 'Drop images here' : 'Drag images here or click to browse'}
                </span>
                <span id="gallery-upload-rules" className="mt-1 text-xs text-gray-500">
                  JPG, PNG or WebP · 5 MB each · {5 - totalCount} remaining
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {isFull && (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
          Gallery full — remove an image to upload another.
        </p>
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
            <img
              src={img.publicUrl}
              alt={`Product gallery image ${idx + 1}`}
              className="h-full w-full object-cover"
            />

            {/* Badges */}
            {img.isPrimary && (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#0b2e59] text-white text-[10px] font-semibold rounded shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> Primary
              </span>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(img.id)}
                  disabled={disabled}
                  className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-sm"
                  title="Delete image"
                  aria-label={`Remove gallery image ${idx + 1}`}
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
                    aria-label={`Move image ${idx + 1} left`}
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || idx === gallery.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="p-1 bg-white/90 hover:bg-white text-gray-700 rounded disabled:opacity-30"
                    title="Move right"
                    aria-label={`Move image ${idx + 1} right`}
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
          return (
            <LocalImagePreview
              key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
              file={f}
              index={idx}
              onRemove={() => {
                const updated = [...localFiles];
                updated.splice(idx, 1);
                onLocalFilesChange?.(updated);
              }}
            />
          );
        })}

        {totalCount === 0 && (
          <div className="col-span-2 flex min-h-28 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-4 text-center sm:col-span-3 md:col-span-5">
            <ImageIcon className="mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            <span className="text-xs font-medium text-gray-600">No gallery images yet</span>
            <span className="mt-1 text-[11px] text-gray-400">
              Uploaded images will appear here in display order.
            </span>
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

function LocalImagePreview({
  file,
  index,
  onRemove,
}: {
  file: File;
  index: number;
  onRemove: () => void;
}) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-blue-400 bg-blue-50 shadow-sm">
      <img
        src={previewUrl}
        alt={`New gallery upload: ${file.name}`}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6">
        <p className="truncate text-[10px] font-medium text-white" title={file.name}>
          {file.name}
        </p>
      </div>
      <div className="absolute left-1.5 top-1.5 rounded bg-[var(--color-metro-navy)] px-1.5 py-0.5 text-[9px] font-semibold text-white">
        New
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 rounded bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={`Remove new image ${index + 1}: ${file.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

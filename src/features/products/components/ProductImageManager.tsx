/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from 'react';
import { useUpdateProductImage, useDeleteProductImage } from '../hooks/useProduct';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MediaSelectorModal } from '@/features/media/components/MediaSelectorModal';
import { Media } from '@/features/media/types';
import { urlToFile } from '@/lib/utils/media';
import {
  FileImage,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  Eye,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react';

export function ProductImageManager({ product }: { product: Product }) {
  const updateImage = useUpdateProductImage(product.id);
  const deleteImage = useDeleteProductImage(product.id);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = (file?: File) => {
    if (!file) return;

    setValidationError(null);

    if (file.size > 5 * 1024 * 1024) {
      const message = 'This image is larger than 5 MB. Choose a smaller file.';
      setValidationError(message);
      toast.error(message);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      const message = 'This file type is not supported. Choose a JPG, PNG, or WebP image.';
      setValidationError(message);
      toast.error(message);
      return;
    }

    updateImage.mutate(file, {
      onSuccess: () => {
        toast.success('Image updated successfully.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Failed to upload image.'
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isPending) uploadFile(e.dataTransfer.files?.[0]);
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    setIsConfirmOpen(false);
    deleteImage.mutate(undefined, {
      onSuccess: () => {
        toast.success('Image deleted successfully.');
      },
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      onError: (err: any) =>
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Failed to delete image.'
        ),
    });
  };

  const handleMediaSelect = async (media: Media) => {
    setIsMediaModalOpen(false);
    try {
      const file = await urlToFile(media);
      updateImage.mutate(file, {
        onSuccess: () => {
          toast.success('Image updated successfully from media library.');
        },
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.error?.message ||
              err?.response?.data?.message ||
              'Failed to set image.'
          );
        },
      });
    } catch (err: unknown) {
      console.error('Failed to load selected media image:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load selected media image.';
      toast.error(msg);
    }
  };

  const isPending = updateImage.isPending || deleteImage.isPending;

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_20px_rgba(15,38,68,0.04)] sm:p-6 transition-all hover:shadow-[0_8px_30px_rgba(15,38,68,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Primary Product Image</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Cover Image
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            This is the main hero image displayed across the public catalog and search cards.
          </p>
        </div>
      </div>

      {validationError && (
        <p
          className="rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-700 shadow-2xs"
          role="alert"
        >
          {validationError}
        </p>
      )}

      <div className="space-y-4">
        {/* Image Preview Container */}
        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Hover Overlay Action Controls */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/50 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-xs transition hover:bg-white hover:scale-105"
                  title="View full image"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-600" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-metro-navy)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#16437e] hover:scale-105 disabled:opacity-50"
                  title="Replace image"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-amber-300" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 hover:scale-105 disabled:opacity-50"
                  title="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-400">
              <div className="mb-2 rounded-2xl bg-white p-3 shadow-xs ring-1 ring-slate-200">
                <ImageIcon className="h-8 w-8 text-slate-400" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-slate-600">No primary image yet</span>
              <span className="mt-1 text-[11px] text-slate-400">
                Drag a photo or pick from media library
              </span>
            </div>
          )}
        </div>

        {/* Dropzone & Format Chips */}
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <button
            type="button"
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
            disabled={isPending}
            className={`group relative flex w-full items-center justify-center gap-3.5 rounded-xl border-2 border-dashed px-4 py-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-metro-gold)] focus-visible:ring-offset-2 ${
              isDragging
                ? 'border-[var(--color-metro-navy)] bg-blue-50/80 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/60 hover:border-[var(--color-metro-navy)] hover:bg-blue-50/30'
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs ring-1 ring-slate-200 group-hover:scale-105 transition-transform">
              {updateImage.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-metro-navy)]" />
              ) : (
                <UploadCloud className="h-5 w-5 text-[var(--color-metro-navy)]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800">
                {updateImage.isPending
                  ? 'Uploading image...'
                  : isDragging
                    ? 'Drop image right here'
                    : 'Click to upload or drag & drop'}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-medium">JPG</span>
                <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-medium">PNG</span>
                <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-medium">WebP</span>
                <span className="text-slate-400">•</span>
                <span>Max 5 MB</span>
              </div>
            </div>
          </button>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMediaModalOpen(true)}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border-slate-200 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <FileImage className="h-4 w-4 text-[var(--color-metro-navy)]" />
              Media Library
            </Button>

            {product.imageUrl && (
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-red-200 text-red-600 font-semibold shadow-2xs hover:bg-red-50 hover:text-red-700"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteImage.isPending ? 'Removing...' : 'Remove Photo'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full-size Image Preview Modal */}
      {isPreviewOpen && product.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/70 p-1.5 text-white shadow-md backdrop-blur-xs transition hover:bg-slate-900"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
            <div className="p-3 text-center">
              <p className="text-sm font-semibold text-slate-800">{product.name}</p>
              <p className="text-xs text-slate-500">SKU: {product.sku}</p>
            </div>
          </div>
        </div>
      )}

      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Remove Primary Image"
        message="Are you sure you want to remove the primary image? This will remove it from all public product cards."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={true}
      />
    </div>
  );
}

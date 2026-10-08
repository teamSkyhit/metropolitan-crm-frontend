/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from 'react';
import { useUpdateProductImage, useDeleteProductImage } from '../hooks/useProduct';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function ProductImageManager({ product }: { product: Product }) {
  const updateImage = useUpdateProductImage(product.id);
  const deleteImage = useDeleteProductImage(product.id);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB maximum size limit.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
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

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
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

  const isPending = updateImage.isPending || deleteImage.isPending;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Primary Image</h3>

      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="flex-shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-md border border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-sm text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="space-y-4 flex-1">
          <p className="text-sm text-gray-500">
            Upload a high-quality image. Max size 5MB. Accepted formats: PNG, JPEG, WebP.
          </p>

          <div className="flex flex-wrap gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              {updateImage.isPending ? 'Uploading...' : 'Upload Image'}
            </Button>

            {product.imageUrl && (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleDelete}
                disabled={isPending}
              >
                {deleteImage.isPending ? 'Removing...' : 'Remove Image'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Remove Image"
        message="Are you sure you want to remove the product image?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={true}
      />
    </div>
  );
}

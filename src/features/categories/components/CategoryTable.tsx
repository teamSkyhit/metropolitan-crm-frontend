/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';
import { Edit, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Category } from '../types';
import { useDeleteCategory } from '../hooks/useCategories';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
}

export function CategoryTable({ categories, isLoading }: CategoryTableProps) {
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading categories...</div>;
  }

  if (!categories?.length) {
    return <div className="p-4 text-center text-gray-500">No categories found.</div>;
  }

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {category.bannerUrl ? (
                    <img
                      src={category.bannerUrl}
                      alt=""
                      className="h-8 w-8 rounded object-cover mr-3"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center mr-3 text-gray-400">
                      <ImageIcon size={16} />
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category.sortOrder}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link
                    href={`/categories/${category.id}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

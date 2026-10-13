'use client';

import React, { useState } from 'react';
import { ProductFeature } from '../types';
import { IconPicker } from '@/components/ui/icon-picker/IconPicker';
import { ProductContentIcon } from '@/components/ui/icon-picker/ProductContentIcon';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

interface ProductFeaturesEditorProps {
  features: ProductFeature[];
  onChange?: (features: ProductFeature[]) => void;
  onAddAsync?: (feature: {
    icon: string;
    title: string;
    description: string;
    sortOrder?: number;
  }) => Promise<void>;
  onUpdateAsync?: (
    featureId: string,
    feature: { icon?: string; title?: string; description?: string }
  ) => Promise<void>;
  onReorderAsync?: (featureIds: string[]) => Promise<void>;
  onDeleteAsync?: (featureId: string) => Promise<void>;
  disabled?: boolean;
}

export function ProductFeaturesEditor({
  features,
  onChange,
  onAddAsync,
  onUpdateAsync,
  onReorderAsync,
  onDeleteAsync,
  disabled = false,
}: ProductFeaturesEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ icon: string; title: string; description: string }>({
    icon: 'gear',
    title: '',
    description: '',
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<{ icon: string; title: string; description: string }>({
    icon: 'gear',
    title: '',
    description: '',
  });

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setNewForm({ icon: 'gear', title: '', description: '' });
  };

  const handleSaveNew = async () => {
    if (!newForm.title.trim() || !newForm.description.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddAsync) {
        await onAddAsync({ ...newForm, sortOrder: features.length });
      } else if (onChange) {
        const newFeat: ProductFeature = {
          id: `temp-${Date.now()}`,
          ...newForm,
          sortOrder: features.length,
        };
        onChange([...features, newFeat]);
      }
      setIsAddingNew(false);
      setNewForm({ icon: 'gear', title: '', description: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (feature: ProductFeature) => {
    setEditingId(feature.id);
    setEditForm({ icon: feature.icon, title: feature.title, description: feature.description });
  };

  const handleSaveEdit = async (featureId: string) => {
    if (!editForm.title.trim() || !editForm.description.trim()) return;
    setIsSubmitting(true);
    try {
      if (onUpdateAsync) {
        await onUpdateAsync(featureId, editForm);
      } else if (onChange) {
        onChange(features.map((f) => (f.id === featureId ? { ...f, ...editForm } : f)));
      }
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= features.length) return;
    const reordered = [...features];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    if (onReorderAsync) {
      await onReorderAsync(reordered.map((f) => f.id));
    } else if (onChange) {
      onChange(reordered.map((f, idx) => ({ ...f, sortOrder: idx })));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      if (onDeleteAsync) {
        await onDeleteAsync(deleteTargetId);
      } else if (onChange) {
        onChange(features.filter((f) => f.id !== deleteTargetId));
      }
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product Features</h4>
          <p className="text-xs text-gray-500">
            Add key engineering or operational features with dynamic icons displayed on the Product
            Detail Page.
          </p>
        </div>
        {!isAddingNew && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleStartAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0b2e59] hover:bg-[#0b2e59]/90 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Feature
          </button>
        )}
      </div>

      {/* New Feature Form */}
      {isAddingNew && (
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">New Product Feature</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Feature Icon</label>
              <IconPicker
                value={newForm.icon}
                onChange={(icon) => setNewForm((prev) => ({ ...prev, icon }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Feature Title *
              </label>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Robust Epicyclic Gearing"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Feature Description *
            </label>
            <textarea
              rows={2}
              value={newForm.description}
              onChange={(e) => setNewForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed technical explanation of this feature..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || !newForm.title.trim() || !newForm.description.trim()}
              onClick={handleSaveNew}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#0b2e59] hover:bg-[#0b2e59]/90 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Feature'}
            </button>
          </div>
        </div>
      )}

      {/* Feature Items List */}
      {features.length === 0 && !isAddingNew ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-500">
          No features added yet. Click &quot;Add Feature&quot; to highlight product capabilities.
        </div>
      ) : (
        <div className="space-y-2">
          {features.map((feature, idx) => {
            const isEditing = editingId === feature.id;

            if (isEditing) {
              return (
                <div
                  key={feature.id}
                  className="p-3 bg-gray-50 border border-gray-300 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                      <IconPicker
                        value={editForm.icon}
                        onChange={(icon) => setEditForm((prev) => ({ ...prev, icon }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSaveEdit(feature.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#0b2e59] rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={feature.id}
                className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ProductContentIcon icon={feature.icon} className="w-5 h-5 text-[#0b2e59]" />
                  </div>
                  <div className="truncate pr-2">
                    <h5 className="text-sm font-semibold text-gray-900 truncate">
                      {feature.title}
                    </h5>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={disabled || idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                    aria-label="Move feature up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || idx === features.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                    aria-label="Move feature down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleStartEdit(feature)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50"
                    aria-label="Edit feature"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setDeleteTargetId(feature.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                    aria-label="Delete feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Feature"
        message="Are you sure you want to delete this feature? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isDestructive={true}
      />
    </div>
  );
}

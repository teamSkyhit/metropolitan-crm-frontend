'use client';

import React, { useState } from 'react';
import { ProductKeyBenefit } from '../types';
import { IconPicker } from '@/components/ui/icon-picker/IconPicker';
import { ProductContentIcon } from '@/components/ui/icon-picker/ProductContentIcon';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

interface ProductKeyBenefitsEditorProps {
  benefits: ProductKeyBenefit[];
  onChange?: (benefits: ProductKeyBenefit[]) => void;
  onAddAsync?: (benefit: {
    icon: string;
    title: string;
    description: string;
    sortOrder?: number;
  }) => Promise<void>;
  onUpdateAsync?: (
    benefitId: string,
    benefit: { icon?: string; title?: string; description?: string }
  ) => Promise<void>;
  onReorderAsync?: (benefitIds: string[]) => Promise<void>;
  onDeleteAsync?: (benefitId: string) => Promise<void>;
  disabled?: boolean;
}

export function ProductKeyBenefitsEditor({
  benefits,
  onChange,
  onAddAsync,
  onUpdateAsync,
  onReorderAsync,
  onDeleteAsync,
  disabled = false,
}: ProductKeyBenefitsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ icon: string; title: string; description: string }>({
    icon: 'shield',
    title: '',
    description: '',
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<{ icon: string; title: string; description: string }>({
    icon: 'shield',
    title: '',
    description: '',
  });

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setNewForm({ icon: 'shield', title: '', description: '' });
  };

  const handleSaveNew = async () => {
    if (!newForm.title.trim() || !newForm.description.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddAsync) {
        await onAddAsync({ ...newForm, sortOrder: benefits.length });
      } else if (onChange) {
        const newBen: ProductKeyBenefit = {
          id: `temp-${Date.now()}`,
          ...newForm,
          sortOrder: benefits.length,
        };
        onChange([...benefits, newBen]);
      }
      setIsAddingNew(false);
      setNewForm({ icon: 'shield', title: '', description: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (benefit: ProductKeyBenefit) => {
    setEditingId(benefit.id);
    setEditForm({ icon: benefit.icon, title: benefit.title, description: benefit.description });
  };

  const handleSaveEdit = async (benefitId: string) => {
    if (!editForm.title.trim() || !editForm.description.trim()) return;
    setIsSubmitting(true);
    try {
      if (onUpdateAsync) {
        await onUpdateAsync(benefitId, editForm);
      } else if (onChange) {
        onChange(benefits.map((b) => (b.id === benefitId ? { ...b, ...editForm } : b)));
      }
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= benefits.length) return;
    const reordered = [...benefits];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    if (onReorderAsync) {
      await onReorderAsync(reordered.map((b) => b.id));
    } else if (onChange) {
      onChange(reordered.map((b, idx) => ({ ...b, sortOrder: idx })));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      if (onDeleteAsync) {
        await onDeleteAsync(deleteTargetId);
      } else if (onChange) {
        onChange(benefits.filter((b) => b.id !== deleteTargetId));
      }
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Key Benefits</h4>
          <p className="text-xs text-gray-500">
            Communicate customer advantages, durability ratings, and operational ROI.
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
            Add Benefit
          </button>
        )}
      </div>

      {/* New Benefit Form */}
      {isAddingNew && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">New Key Benefit</span>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Benefit Icon</label>
              <IconPicker
                value={newForm.icon}
                onChange={(icon) => setNewForm((prev) => ({ ...prev, icon }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Benefit Title *
              </label>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Robust Construction & Longevity"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Benefit Description *
            </label>
            <textarea
              rows={2}
              value={newForm.description}
              onChange={(e) => setNewForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Explain how this benefits client downtime, cost, or reliability..."
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
              {isSubmitting ? 'Saving...' : 'Save Benefit'}
            </button>
          </div>
        </div>
      )}

      {/* Benefit Items List */}
      {benefits.length === 0 && !isAddingNew ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-500">
          No key benefits added yet. Click &quot;Add Benefit&quot; to highlight customer value
          propositions.
        </div>
      ) : (
        <div className="space-y-2">
          {benefits.map((benefit, idx) => {
            const isEditing = editingId === benefit.id;

            if (isEditing) {
              return (
                <div
                  key={benefit.id}
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
                      onClick={() => handleSaveEdit(benefit.id)}
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
                key={benefit.id}
                className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ProductContentIcon icon={benefit.icon} className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="truncate pr-2">
                    <h5 className="text-sm font-semibold text-gray-900 truncate">
                      {benefit.title}
                    </h5>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {benefit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={disabled || idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                    aria-label="Move benefit up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || idx === benefits.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                    aria-label="Move benefit down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleStartEdit(benefit)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50"
                    aria-label="Edit benefit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setDeleteTargetId(benefit.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                    aria-label="Delete benefit"
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
        title="Delete Key Benefit"
        message="Are you sure you want to delete this benefit? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isDestructive={true}
      />
    </div>
  );
}

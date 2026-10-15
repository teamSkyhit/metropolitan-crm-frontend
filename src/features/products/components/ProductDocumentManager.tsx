'use client';

import React, { useRef, useState } from 'react';
import { ProductDocument } from '../types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  FileText,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductDocumentManagerProps {
  documents: ProductDocument[];
  onUploadAsync?: (files: File[], title?: string) => Promise<void>;
  onUpdateTitleAsync?: (documentId: string, title: string) => Promise<void>;
  onReorderAsync?: (documentIds: string[]) => Promise<void>;
  onDeleteAsync?: (documentId: string) => Promise<void>;
  // For Create mode
  onLocalFilesChange?: (files: { file: File; title: string }[]) => void;
  localFiles?: { file: File; title: string }[];
  disabled?: boolean;
}

export function ProductDocumentManager({
  documents,
  onUploadAsync,
  onUpdateTitleAsync,
  onReorderAsync,
  onDeleteAsync,
  onLocalFilesChange,
  localFiles = [],
  disabled = false,
}: ProductDocumentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [pendingTitle, setPendingTitle] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const totalCount = documents.length + localFiles.length;
  const isFull = totalCount >= 3;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setValidationError('');

    const rejectFile = (message: string) => {
      setValidationError(message);
      toast.error(message);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Validation: PDF only and 10MB max
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      rejectFile('This document format is not supported. Choose a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      rejectFile('This PDF is larger than 10 MB. Choose a smaller file.');
      return;
    }

    if (totalCount >= 3) {
      rejectFile('This product already has the maximum of 3 documents.');
      return;
    }

    const titleToUse = pendingTitle.trim() || file.name.replace(/\.[^/.]+$/, '');

    if (onUploadAsync) {
      setIsUploading(true);
      try {
        await onUploadAsync([file], titleToUse);
        toast.success('Document uploaded successfully.');
        setPendingTitle('');
      } catch (err: unknown) {
        const anyErr = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const message =
          anyErr?.response?.data?.error?.message ||
          anyErr?.response?.data?.message ||
          'Failed to upload document.';
        setValidationError(message);
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    } else if (onLocalFilesChange) {
      onLocalFilesChange([...localFiles, { file, title: titleToUse }]);
      setPendingTitle('');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveTitle = async (documentId: string) => {
    if (!editTitle.trim()) return;
    if (onUpdateTitleAsync) {
      try {
        await onUpdateTitleAsync(documentId, editTitle.trim());
        toast.success('Document title updated.');
        setEditingId(null);
      } catch {
        toast.error('Failed to update document title.');
      }
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= documents.length) return;

    const reordered = [...documents];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    if (onReorderAsync) {
      try {
        await onReorderAsync(reordered.map((d) => d.id));
      } catch {
        toast.error('Failed to reorder documents.');
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      if (onDeleteAsync) {
        await onDeleteAsync(deleteTargetId);
        toast.success('Document removed.');
      }
    } catch {
      toast.error('Failed to delete document.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product Documents (PDFs)</h4>
          <p className="text-xs text-gray-500">
            Upload up to 3 PDF technical datasheets, CAD drawings, or brochures (Max 10 MB each).
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
          {totalCount} of 3 documents
        </span>
      </div>

      {validationError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          role="alert"
        >
          {validationError}
        </div>
      )}

      {/* Upload Box */}
      {!isFull && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Document Title (Optional)
            </label>
            <input
              type="text"
              maxLength={150}
              disabled={disabled || isUploading}
              value={pendingTitle}
              onChange={(e) => setPendingTitle(e.target.value)}
              placeholder="e.g. Technical Datasheet & Dimensional Spec"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            accept="application/pdf"
            className="hidden"
            disabled={disabled || isUploading}
          />

          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            aria-describedby="document-upload-rules"
            className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-[#0b2e59] rounded-md flex flex-col items-center justify-center text-gray-600 hover:bg-blue-50/20 transition-colors"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-[#0b2e59] animate-spin" />
                <span className="text-xs font-medium">Uploading PDF document...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">Select PDF document</span>
              </div>
            )}
          </button>
          <p id="document-upload-rules" className="text-center text-[11px] text-gray-500">
            One file at a time · PDF only · Maximum 10 MB
          </p>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:border-gray-300 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                <FileText className="w-5 h-5" />
              </div>

              {editingId === doc.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    maxLength={150}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="px-2 py-0.5 text-xs border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveTitle(doc.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {doc.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(doc.id);
                        setEditTitle(doc.title);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                      title="Edit title"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  {doc.originalFileName && (
                    <p className="text-[11px] text-gray-400 truncate">{doc.originalFileName}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <a
                href={doc.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <button
                type="button"
                disabled={disabled || idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                aria-label="Move document up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={disabled || idx === documents.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                aria-label="Move document down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setDeleteTargetId(doc.id)}
                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 ml-0.5"
                aria-label="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Local Files in Create Mode */}
        {localFiles.map((loc, idx) => (
          <div
            key={`loc-doc-${idx}`}
            className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900 truncate">{loc.title}</span>
              <span className="text-[10px] text-blue-500 font-mono">({loc.file.name})</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = [...localFiles];
                updated.splice(idx, 1);
                onLocalFilesChange?.(updated);
              }}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {totalCount === 0 && (
          <div className="p-4 text-center text-xs text-gray-400 border border-gray-200 rounded-lg">
            No technical documents or brochures attached.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Remove Document"
        message="Are you sure you want to remove this PDF document?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isDestructive={true}
      />
    </div>
  );
}

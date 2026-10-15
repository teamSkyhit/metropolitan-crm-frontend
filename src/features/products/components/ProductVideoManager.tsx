'use client';

import React, { useRef, useState } from 'react';
import { ProductVideo } from '../types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Video, Upload, Trash2, ArrowUp, ArrowDown, Edit2, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductVideoManagerProps {
  videos: ProductVideo[];
  onUploadAsync?: (files: File[], title?: string) => Promise<void>;
  onUpdateTitleAsync?: (videoId: string, title: string) => Promise<void>;
  onReorderAsync?: (videoIds: string[]) => Promise<void>;
  onDeleteAsync?: (videoId: string) => Promise<void>;
  // For Create mode
  onLocalFilesChange?: (files: { file: File; title: string }[]) => void;
  localFiles?: { file: File; title: string }[];
  disabled?: boolean;
}

export function ProductVideoManager({
  videos,
  onUploadAsync,
  onUpdateTitleAsync,
  onReorderAsync,
  onDeleteAsync,
  onLocalFilesChange,
  localFiles = [],
  disabled = false,
}: ProductVideoManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [pendingTitle, setPendingTitle] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const totalCount = videos.length + localFiles.length;
  const isFull = totalCount >= 2;

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

    // Validation: video format and 100MB max
    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      rejectFile('This video format is not supported. Choose an MP4 or WebM file.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      rejectFile('This video is larger than 100 MB. Choose a smaller file.');
      return;
    }

    if (totalCount >= 2) {
      rejectFile('This product already has the maximum of 2 videos.');
      return;
    }

    if (onUploadAsync) {
      setIsUploading(true);
      try {
        await onUploadAsync([file], pendingTitle.trim() || undefined);
        toast.success('Video uploaded successfully.');
        setPendingTitle('');
      } catch (err: unknown) {
        const anyErr = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        let message = 'Failed to upload video.';
        if (anyErr?.response?.status === 413) {
          message =
            'This video file is too large for upload through the network proxy. Please choose a smaller or compressed video.';
        } else if (anyErr?.response?.data?.error?.message) {
          message = anyErr.response.data.error.message;
        } else if (anyErr?.response?.data?.message) {
          message = anyErr.response.data.message;
        } else if (anyErr?.message) {
          message = anyErr.message;
        }
        setValidationError(message);
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    } else if (onLocalFilesChange) {
      onLocalFilesChange([...localFiles, { file, title: pendingTitle.trim() || file.name }]);
      setPendingTitle('');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveTitle = async (videoId: string) => {
    if (!editTitle.trim()) return;
    if (onUpdateTitleAsync) {
      try {
        await onUpdateTitleAsync(videoId, editTitle.trim());
        toast.success('Video title updated.');
        setEditingId(null);
      } catch {
        toast.error('Failed to update video title.');
      }
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= videos.length) return;

    const reordered = [...videos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    if (onReorderAsync) {
      try {
        await onReorderAsync(reordered.map((v) => v.id));
      } catch {
        toast.error('Failed to reorder videos.');
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      if (onDeleteAsync) {
        await onDeleteAsync(deleteTargetId);
        toast.success('Video removed.');
      }
    } catch {
      toast.error('Failed to delete video.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product Videos</h4>
          <p className="text-xs text-gray-500">
            Upload up to 2 videos (MP4 or WebM, Max 100 MB each). Videos will render with HTML5
            native controls.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
          {totalCount} of 2 videos
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
              Video Title (Optional)
            </label>
            <input
              type="text"
              maxLength={150}
              disabled={disabled || isUploading}
              value={pendingTitle}
              onChange={(e) => setPendingTitle(e.target.value)}
              placeholder="e.g. 360-degree Assembly Walkthrough"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0b2e59]"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            accept="video/mp4,video/webm"
            className="hidden"
            disabled={disabled || isUploading}
          />

          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            aria-describedby="video-upload-rules"
            className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-[#0b2e59] rounded-md flex flex-col items-center justify-center text-gray-600 hover:bg-blue-50/20 transition-colors"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-[#0b2e59] animate-spin" />
                <span className="text-xs font-medium">
                  Uploading video file (this may take a few moments)...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">
                  Select MP4 or WebM video file
                </span>
              </div>
            )}
          </button>
          <p id="video-upload-rules" className="text-center text-[11px] text-gray-500">
            One file at a time · MP4 or WebM · Maximum 100 MB
          </p>
        </div>
      )}

      {/* Videos List */}
      <div className="space-y-3">
        {videos.map((vid, idx) => (
          <div
            key={vid.id}
            className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2 hover:border-gray-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Video className="w-4 h-4 text-[#0b2e59] flex-shrink-0" />
                {editingId === vid.id ? (
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
                      onClick={() => handleSaveTitle(vid.id)}
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
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {vid.title || 'Untitled Product Video'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(vid.id);
                        setEditTitle(vid.title || '');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                      title="Edit title"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                  aria-label="Move video up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled || idx === videos.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                  aria-label="Move video down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setDeleteTargetId(vid.id)}
                  className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 ml-1"
                  aria-label="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Native HTML5 Video Element */}
            <div className="aspect-video bg-black rounded overflow-hidden max-w-md mx-auto">
              <video
                src={vid.publicUrl}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        ))}

        {/* Local Files in Create Mode */}
        {localFiles.map((loc, idx) => (
          <div
            key={`loc-vid-${idx}`}
            className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Video className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900 truncate">{loc.title}</span>
              <span className="text-[10px] text-blue-500 font-mono">
                ({(loc.file.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
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
            No product videos attached.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Remove Video"
        message="Are you sure you want to remove this video?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isDestructive={true}
      />
    </div>
  );
}

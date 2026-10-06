'use client';
import React from 'react';
import { useMediaById } from '../hooks/useMedia';
import { Image as ImageIcon } from 'lucide-react';

export function MediaPreview({
  mediaId,
  className,
}: {
  mediaId?: string | null;
  className?: string;
}) {
  const { data: media, isLoading, isError } = useMediaById(mediaId);

  if (!mediaId) {
    return <ImageIcon className="text-gray-400 w-6 h-6" />;
  }

  if (isLoading) {
    return <div className="text-xs text-gray-400">Loading...</div>;
  }

  if (isError || !media?.publicUrl) {
    return (
      <span className="text-[10px] text-gray-500 font-mono break-all px-2 leading-tight">
        {mediaId}
      </span>
    );
  }

  /* eslint-disable-next-line @next/next/no-img-element */
  return (
    <img
      src={media.thumbnailUrl || media.publicUrl}
      alt="Preview"
      className={`object-cover w-full h-full ${className || ''}`}
    />
  );
}

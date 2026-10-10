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
  const [hasImgError, setHasImgError] = React.useState(false);

  if (!mediaId) {
    return <ImageIcon className="text-gray-400 w-6 h-6" />;
  }

  if (isLoading) {
    return <div className="text-xs text-gray-400">Loading...</div>;
  }

  if (isError || !media?.publicUrl || hasImgError) {
    return (
      <div className="flex flex-col items-center justify-center p-1 text-center w-full h-full">
        <ImageIcon className="text-gray-400 w-5 h-5 mb-0.5" />
        <span className="text-[9px] text-gray-500 font-mono break-all px-1 leading-tight line-clamp-1">
          {media?.fileName || mediaId}
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={media.thumbnailUrl || media.publicUrl}
      alt={media.fileName || 'Preview'}
      className={`object-cover w-full h-full ${className || ''}`}
      onError={() => setHasImgError(true)}
    />
  );
}

'use client';
import React from 'react';
import { useMediaById } from '../hooks/useMedia';
import { Image as ImageIcon, FileText, Video } from 'lucide-react';

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

  if (isError || !media?.publicUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-1 text-center w-full h-full bg-gray-50 text-gray-400">
        <ImageIcon className="text-gray-400 w-5 h-5 mb-0.5" />
        <span className="text-[9px] text-gray-500 font-mono break-all px-1 leading-tight line-clamp-1">
          {media?.fileName || mediaId}
        </span>
      </div>
    );
  }

  const mime = media.mimeType?.toLowerCase() || '';
  const name = media.fileName?.toLowerCase() || '';
  const isPdf = mime.includes('pdf') || name.endsWith('.pdf');
  const isVideo = mime.startsWith('video/') || /\.(mp4|webm|ogg|mov|mkv)$/i.test(name);

  if (isPdf) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-2 bg-red-50 text-red-600 rounded text-center w-full h-full border border-red-100 ${
          className || ''
        }`}
      >
        <FileText className="w-6 h-6 mb-1 text-red-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">PDF</span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gray-900 rounded overflow-hidden w-full h-full ${
          className || ''
        }`}
      >
        <video
          src={`${media.publicUrl}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
          onError={() => setHasImgError(true)}
        />
        {hasImgError ? <Video className="w-6 h-6 text-blue-400" /> : null}
      </div>
    );
  }

  if (hasImgError) {
    return (
      <div className="flex flex-col items-center justify-center p-1 text-center w-full h-full bg-gray-50 text-gray-400">
        <ImageIcon className="text-gray-400 w-5 h-5 mb-0.5" />
        <span className="text-[9px] text-gray-500 font-mono break-all px-1 leading-tight line-clamp-1">
          {media.fileName || mediaId}
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

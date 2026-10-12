import { Media } from '@/features/media/types';

/**
 * Downloads a media asset from its public URL and returns a standard File object.
 * This allows using media selected from the Media Library anywhere a File upload is expected.
 */
export async function urlToFile(media: Media): Promise<File> {
  const url = media.publicUrl || media.thumbnailUrl;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download media file');
  }
  const blob = await response.blob();
  const filename = media.fileName || 'selected-media.png';
  const mimeType = media.mimeType || blob.type || 'image/png';
  return new File([blob], filename, { type: mimeType });
}

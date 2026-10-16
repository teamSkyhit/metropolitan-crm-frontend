import { Media } from '@/features/media/types';

/**
 * Downloads a media asset from its public URL and returns a standard File object.
 * This allows using media selected from the Media Library anywhere a File upload is expected.
 *
 * Automatically proxies through /api/media-proxy if the remote storage (such as Cloudflare R2
 * or S3) does not provide Access-Control-Allow-Origin CORS headers in browser requests.
 */
export async function urlToFile(media: Media): Promise<File> {
  const url = media.publicUrl || media.thumbnailUrl;
  if (!url) {
    throw new Error('No media URL provided for selection');
  }

  let blob: Blob;

  // Cloudflare R2 public domains (e.g., *.r2.dev) do not serve CORS headers by default.
  // We can route directly to our same-origin proxy to prevent ugly browser CORS console errors.
  const isKnownNonCorsHost = url.includes('.r2.dev');

  if (isKnownNonCorsHost) {
    const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(url)}`;
    const proxyRes = await fetch(proxyUrl);
    if (!proxyRes.ok) {
      throw new Error(`Failed to load media via proxy (${proxyRes.status})`);
    }
    blob = await proxyRes.blob();
  } else {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Direct download responded with status ${response.status}`);
      }
      blob = await response.blob();
    } catch {
      // If direct fetch fails (CORS restriction or network issue), fall back to same-origin proxy
      const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl);
      if (!proxyRes.ok) {
        throw new Error(`Failed to load media via proxy fallback (${proxyRes.status})`);
      }
      blob = await proxyRes.blob();
    }
  }

  const filename = media.fileName || 'selected-media.png';
  const mimeType = media.mimeType || blob.type || 'image/png';
  return new File([blob], filename, { type: mimeType });
}

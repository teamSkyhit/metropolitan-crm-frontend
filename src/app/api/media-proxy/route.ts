import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Route Handler that acts as a same-origin proxy for downloading
 * remote media assets (e.g., Cloudflare R2, S3, or external storage)
 * that lack Access-Control-Allow-Origin CORS headers.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
  }

  // Only allow HTTP/HTTPS protocols
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }

  // Basic SSRF protection: reject obvious private metadata endpoints in production
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    process.env.NODE_ENV === 'production' &&
    (hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.internal'))
  ) {
    return NextResponse.json({ error: 'Access to local resources is denied' }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const upstreamResponse = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        Accept: '*/*',
        'User-Agent': 'MetropolitanCRM-MediaProxy/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Upstream storage responded with status ${upstreamResponse.status}` },
        { status: upstreamResponse.status }
      );
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown upstream error';
    return NextResponse.json(
      { error: `Failed to fetch remote asset: ${message}` },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

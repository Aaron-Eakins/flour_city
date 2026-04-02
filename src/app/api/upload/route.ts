import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

// This route acts as the Vercel Blob "token endpoint".
// The client calls it to get a short-lived upload token, then uploads
// the file directly from the browser to blob storage -- bypassing the
// Vercel 4.5MB serverless function body limit entirely.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate extension before issuing the upload token
        const lower = pathname.toLowerCase();
        if (!lower.endsWith('.stl') && !lower.endsWith('.3mf')) {
          throw new Error('Only .stl and .3mf files are allowed');
        }
        return {
          allowedContentTypes: [
            'application/octet-stream',
            'model/stl',
            'model/3mf',
            'application/x-tgif',
            // Some browsers send these MIME types for binary files
            'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
          ],
          // 50MB upper bound -- Vercel Blob handles large files; our function never sees them
          maximumSizeInBytes: 50 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Blob upload is confirmed. The client will call /api/quote next.
        console.log('Blob upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob token error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

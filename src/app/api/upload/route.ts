import { NextRequest, NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function canUseLocalStorageFallback(): boolean {
  return process.env.NODE_ENV !== 'production';
}

async function saveLocally(file: File, fileName: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, fileName), buffer);

  return `/uploads/${fileName}`;
}

async function uploadToBlob(file: File, fileName: string): Promise<string> {
  const result = await put(fileName, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return result.url;
}

// POST - Upload image (Vercel Blob in production, local fallback in development)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;

    let imageUrl: string;

    // Try Vercel Blob first (production)
    if (isBlobConfigured()) {
      try {
        imageUrl = await uploadToBlob(file, fileName);

        return NextResponse.json({
          success: true,
          imageUrl,
        });
      } catch (blobError) {
        console.error('Vercel Blob upload failed:', blobError);

        if (!canUseLocalStorageFallback()) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Upload failed in production. Configure BLOB_READ_WRITE_TOKEN for Vercel Blob storage.',
            },
            { status: 502 }
          );
        }

        console.log('Falling back to local storage (development only).');
      }
    } else {
      // No Vercel Blob configured
      if (!canUseLocalStorageFallback()) {
        return NextResponse.json(
          {
            success: false,
            error:
              'No production upload provider configured. Set BLOB_READ_WRITE_TOKEN for Vercel Blob.',
          },
          { status: 500 }
        );
      }
    }

    // Use local storage fallback (development)
    imageUrl = await saveLocally(file, fileName);
    
    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToDrive } from '@/lib/google';
import { isAdminSession } from '@/lib/auth';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function isGoogleDriveConfigured(): boolean {
  return (
    !!process.env.GOOGLE_DRIVE_FOLDER_ID &&
    !!process.env.GOOGLE_CLIENT_EMAIL &&
    !!process.env.GOOGLE_PRIVATE_KEY
  );
}

function isGoogleDriveEnabled(): boolean {
  return process.env.ENABLE_GOOGLE_DRIVE_UPLOAD === 'true';
}

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

// POST - Upload image (Vercel Blob -> Google Drive -> local dev fallback)
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

    if (isBlobConfigured()) {
      try {
        imageUrl = await uploadToBlob(file, fileName);

        return NextResponse.json({
          success: true,
          imageUrl,
        });
      } catch (blobError) {
        console.error('Vercel Blob upload failed:', blobError);
      }
    }

    if (isGoogleDriveEnabled() && isGoogleDriveConfigured()) {
      try {
        imageUrl = await uploadImageToDrive(file, fileName);
      } catch (driveError) {
        console.error('Google Drive upload failed:', driveError);

        if (!canUseLocalStorageFallback()) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Upload failed in production. Configure BLOB_READ_WRITE_TOKEN for Vercel Blob, or verify Google Drive folder access for the service account.',
            },
            { status: 502 }
          );
        }

        console.error('Falling back to local storage (development only).');
        imageUrl = await saveLocally(file, fileName);
      }
    } else {
      if (!canUseLocalStorageFallback()) {
        return NextResponse.json(
          {
            success: false,
            error:
              'No production upload provider configured. Set BLOB_READ_WRITE_TOKEN (recommended) or Google Drive credentials.',
          },
          { status: 500 }
        );
      }

      imageUrl = await saveLocally(file, fileName);
    }
    
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

import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToDrive } from '@/lib/google';
import { isAdminSession } from '@/lib/auth';
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

// POST - Upload image (Google Drive or local fallback)
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

    if (isGoogleDriveConfigured()) {
      try {
        imageUrl = await uploadImageToDrive(file, fileName);
      } catch (driveError) {
        console.error('Google Drive upload failed:', driveError);

        if (!canUseLocalStorageFallback()) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Google Drive upload failed in production. Verify GOOGLE_DRIVE_FOLDER_ID and share that folder with the service account email.',
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
              'Google Drive is not configured for production uploads. Set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_DRIVE_FOLDER_ID.',
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

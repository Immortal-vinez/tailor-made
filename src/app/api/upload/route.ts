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
      // Upload to Google Drive
      imageUrl = await uploadImageToDrive(file, fileName);
    } else {
      // Fallback: save locally to public/uploads/
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadsDir, fileName), buffer);

      imageUrl = `/uploads/${fileName}`;
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

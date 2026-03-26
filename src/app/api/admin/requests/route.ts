import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/auth';

// GET – admin: list all requests ordered newest first
export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requests = await db.request.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

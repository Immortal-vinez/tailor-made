import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST – public: customer submits a product enquiry from the storefront
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, productId, productName, message } = body;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const enquiry = await db.request.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        productId: productId ?? null,
        productName: productName ?? null,
        message: message?.trim() ?? null,
      },
    });

    return NextResponse.json({ success: true, request: enquiry }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

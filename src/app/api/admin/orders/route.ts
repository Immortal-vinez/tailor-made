import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// GET – admin: list all orders newest first
export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const parsed = orders.map((o) => ({
      ...o,
      items: (() => {
        try { return JSON.parse(o.items); } catch { return []; }
      })(),
    }));

    return NextResponse.json({ success: true, orders: parsed });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST – admin: manually log an order
export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, items, totalAmount, note } = body;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail?.trim() ?? null,
        items: JSON.stringify(items ?? []),
        totalAmount: Number(totalAmount) || 0,
        note: note?.trim() ?? null,
      },
    });

    return NextResponse.json(
      { success: true, order: { ...order, items: items ?? [] } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

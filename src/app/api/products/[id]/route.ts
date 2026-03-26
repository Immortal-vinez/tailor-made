import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/auth';
import type { Product } from '@/lib/google';

function toProduct(row: {
  id: string; name: string; description: string; price: number;
  category: string; imageUrl: string; sizes: string; colors: string;
  featured: boolean; createdAt: Date;
}): Product {
  return {
    ...row,
    category: row.category as Product['category'],
    sizes: row.sizes ? row.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
    colors: row.colors ? row.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
    createdAt: row.createdAt.toISOString(),
  };
}

// GET - Fetch single product
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await db.product.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: toProduct(row) });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    const row = await db.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.sizes !== undefined && { sizes: Array.isArray(body.sizes) ? body.sizes.join(',') : body.sizes }),
        ...(body.colors !== undefined && { colors: Array.isArray(body.colors) ? body.colors.join(',') : body.colors }),
        ...(body.featured !== undefined && { featured: body.featured }),
      },
    });

    return NextResponse.json({ success: true, product: toProduct(row) });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}

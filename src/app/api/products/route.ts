import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/auth';
import type { Product } from '@/types/product';

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

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = {};
    if (category && ['men', 'women', 'children'].includes(category)) where.category = category;
    if (featured === 'true') where.featured = true;

    const rows = await db.product.findMany({ where, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ success: true, products: rows.map(toProduct), source: 'local' });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Add a new product
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, category, imageUrl, sizes, colors, featured } = body;

    if (!name?.trim() || !category) {
      return NextResponse.json({ success: false, error: 'Name and category are required' }, { status: 400 });
    }

    const row = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() ?? '',
        price: parseFloat(price) || 0,
        category,
        imageUrl: imageUrl ?? '',
        sizes: Array.isArray(sizes) ? sizes.join(',') : (sizes ?? ''),
        colors: Array.isArray(colors) ? colors.join(',') : (colors ?? ''),
        featured: featured ?? false,
      },
    });

    return NextResponse.json({ success: true, product: toProduct(row) }, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ success: false, error: 'Failed to add product' }, { status: 500 });
  }
}

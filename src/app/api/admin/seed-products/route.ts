import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { dummyProducts } from "@/lib/dummy-data";

function isSeedEnabled(): boolean {
  return process.env.ENABLE_PRODUCT_SEED === "true";
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isSeedEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product seeding is disabled. Set ENABLE_PRODUCT_SEED=true temporarily to run this endpoint.",
        },
        { status: 403 }
      );
    }

    let force = false;
    try {
      const body = (await request.json()) as { force?: boolean };
      force = body?.force === true;
    } catch {
      // Empty body is valid.
    }

    const existingCount = await db.product.count();
    if (existingCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Products already exist. Pass {\"force\": true} to seed only missing IDs.",
          existingCount,
        },
        { status: 409 }
      );
    }

    const result = await db.product.createMany({
      data: dummyProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        sizes: p.sizes.join(","),
        colors: p.colors.join(","),
        featured: p.featured,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      insertedCount: result.count,
      attemptedCount: dummyProducts.length,
      existingCount,
      message:
        result.count === 0
          ? "No new rows inserted (all seed IDs already exist)."
          : "Products seeded successfully.",
    });
  } catch (error) {
    console.error("[seed-products] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed products" },
      { status: 500 }
    );
  }
}

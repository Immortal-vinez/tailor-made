import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.isAdmin === true || session.user.role === "admin") {
      return NextResponse.json({ success: false, error: "Admins should use dashboard" }, { status: 403 });
    }

    const email = session.user.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const rows = await db.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const orders = rows.map((o) => ({
      ...o,
      items: (() => {
        try {
          const parsed = JSON.parse(o.items);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("[account/orders] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch account orders" },
      { status: 500 }
    );
  }
}
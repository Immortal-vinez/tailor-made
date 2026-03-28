import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const reset = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      db.passwordResetToken.deleteMany({
        where: { userId: reset.userId, id: { not: reset.id } },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("[reset-password] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
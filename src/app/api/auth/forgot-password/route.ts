import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESET_EMAIL_FROM?.trim() || process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    console.info("[forgot-password] email not sent (missing RESEND_API_KEY or RESET_EMAIL_FROM)", {
      to,
      resetUrl,
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your ONEWAY password",
      html: `
        <p>You requested a password reset for your ONEWAY account.</p>
        <p>
          Click this link to set a new password (expires in 1 hour):
          <br />
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
      text: `You requested a password reset for your ONEWAY account.\n\nUse this link within 1 hour:\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${details}`);
  }
}

function buildBaseUrl(origin: string | null): string {
  const envBase = process.env.NEXTAUTH_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, "");
  if (origin) return origin.replace(/\/$/, "");
  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always return a generic success response to avoid account enumeration.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists for that email, a reset link has been generated.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = buildBaseUrl(request.headers.get("origin"));
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    try {
      await sendResetEmail(user.email, resetUrl);
    } catch (emailError) {
      // Keep response generic; don't leak mail transport errors to clients.
      console.error("[forgot-password] email send error:", emailError);
    }

    console.info("[forgot-password] reset link", {
      email: user.email,
      resetUrl,
      expiresAt: expiresAt.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset link has been generated.",
      ...(process.env.NODE_ENV !== "production" ? { resetUrl } : {}),
    });
  } catch (error) {
    console.error("[forgot-password] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
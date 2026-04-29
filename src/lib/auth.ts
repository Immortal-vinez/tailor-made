import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { db } from "@/lib/db";

type AdminRole = "admin" | "user";

const adminEmailList = [
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : []),
  ...(process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((email) => email.trim())
    : []),
]
  .filter(Boolean)
  .map((email) => email.toLowerCase());

export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return adminEmailList.includes(email.toLowerCase());
}

function safeEmailFingerprint(email?: string | null): string {
  if (!email) return "none";
  return createHash("sha256")
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 12);
}

function logCustomerAuthFailure(reason: string, email?: string | null): void {
  console.warn("[auth][customer][deny]", {
    reason,
    emailFingerprint: safeEmailFingerprint(email),
  });
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        const expectedPassword = process.env.ADMIN_PASSWORD;

        if (!email || !password || adminEmailList.length === 0 || !expectedPassword) {
          return null;
        }

        if (!adminEmailList.includes(email) || password !== expectedPassword) {
          return null;
        }

        return {
          id: "admin-user",
          email,
          name: "Administrator",
          role: "admin" as AdminRole,
          isAdmin: true,
        };
      },
    }),
    CredentialsProvider({
      id: "customer",
      name: "Customer Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          logCustomerAuthFailure("missing_credentials", email);
          return null;
        }

        // Block if this email is an admin — admins must use the admin login
        if (isAdminEmail(email)) {
          logCustomerAuthFailure("admin_email_on_customer_provider", email);
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, password: true } as any,
        }) as { id: string; email: string; name: string | null; password: string | null } | null;
        if (!user) {
          logCustomerAuthFailure("user_not_found", email);
          return null;
        }

        if (!user.password) {
          logCustomerAuthFailure("user_has_no_password", email);
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          logCustomerAuthFailure("invalid_password", email);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: "user" as AdminRole,
          isAdmin: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }

      if (user && "role" in user && user.role) {
        token.role = user.role as AdminRole;
      }

      const email = typeof token.email === "string" ? token.email : null;
      const admin = isAdminEmail(email) || token.role === "admin";
      token.role = admin ? "admin" : "user";
      token.isAdmin = admin;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : undefined;
        session.user.role = token.role === "admin" ? "admin" : "user";
        session.user.isAdmin = token.isAdmin === true;
      }

      return session;
    },
  },
};

export async function isAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin === true || session?.user?.role === "admin";
}
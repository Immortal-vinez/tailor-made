import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
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
        const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const expectedPassword = process.env.ADMIN_PASSWORD;

        if (!email || !password || !expectedEmail || !expectedPassword) {
          return null;
        }

        if (email !== expectedEmail || password !== expectedPassword) {
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

        if (!email || !password) return null;

        // Block if this email is an admin — admins must use the admin login
        if (isAdminEmail(email)) return null;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -- Prisma client was regenerated; restart TS server if this shows stale type errors
        const user = await db.user.findUnique({
          where: { email },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          select: { id: true, email: true, name: true, password: true } as any,
        }) as { id: string; email: string; name: string | null; password: string | null } | null;
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

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
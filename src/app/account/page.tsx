"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Mail,
  Shirt,
  LogOut,
  ShoppingBag,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/account");
      return;
    }
    // Admins belong in the dashboard, not the customer account page
    if (status === "authenticated" && isAdmin) {
      router.replace("/admin");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || (status === "authenticated" && isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-700" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex min-h-16 py-2 items-center justify-between gap-2 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700">
              <Shirt className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">ONEWAY</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>

        {/* Profile card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 border">
                <User className="h-7 w-7 text-neutral-500" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate">{user?.name ?? "Customer"}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{user?.email}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              Browse our latest arrivals and send us an enquiry — we&apos;ll get back to
              you with sizing, availability, and pricing.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign out link */}
        <p className="mt-8 text-sm text-center text-muted-foreground">
          Not you?{" "}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Sign out
          </button>
        </p>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Mail,
  LogOut,
  ShoppingBag,
  Package,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { formatUsd } from "@/lib/currency";

interface AccountOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  items: Array<{ name?: string; qty?: number; productName?: string }>;
  totalAmount: number;
  status: string;
  note: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-violet-100 text-violet-800 border-violet-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function summarizeItems(items: AccountOrder["items"]): string {
  if (!Array.isArray(items) || items.length === 0) return "No items recorded";

  return items
    .slice(0, 3)
    .map((item) => {
      const name = item?.name || item?.productName || "Item";
      const qty = typeof item?.qty === "number" && item.qty > 0 ? item.qty : 1;
      return `${qty}x ${name}`;
    })
    .join(", ");
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError(null);

    try {
      const res = await fetch("/api/account/orders");
      const data = await res.json();
      if (!data.success) {
        setOrdersError(data.error || "Could not load your orders.");
        setOrders([]);
        return;
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setOrdersError("Could not load your orders.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

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

  useEffect(() => {
    if (status !== "authenticated" || isAdmin) return;

    loadOrders();
  }, [status, isAdmin, loadOrders]);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const inProgress = orders.filter((o) => ["pending", "confirmed", "shipped"].includes(o.status)).length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    return { total, inProgress, delivered };
  }, [orders]);

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
            <Image src="/logo.png" alt="Nyembo Designs" width={36} height={36} className="rounded-full" />
            <span className="text-lg font-bold tracking-tight">Nyembo Designs</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
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

        <section className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> Total
                </p>
                <p className="text-xl font-semibold mt-1">{orderStats.total}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" /> Active
                </p>
                <p className="text-xl font-semibold mt-1">{orderStats.inProgress}</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                </p>
                <p className="text-xl font-semibold mt-1">{orderStats.delivered}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Your latest order updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingOrders ? (
                <div className="py-6 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
                </div>
              ) : ordersError ? (
                <p className="text-sm text-red-600">{ordersError}</p>
              ) : orders.length === 0 ? (
                <div className="text-sm text-muted-foreground space-y-3">
                  <p>No orders yet for this account.</p>
                  <Button asChild size="sm">
                    <Link href="/">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                      <Badge variant="outline" className={STATUS_STYLES[order.status] ?? ""}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{summarizeItems(order.items)}</p>
                    <p className="text-sm font-semibold">{formatUsd(order.totalAmount || 0)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

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

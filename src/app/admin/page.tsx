"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AdminPanel } from "@/components/AdminPanel";
import { CatalogAnalyticsPanel } from "@/components/admin/CatalogAnalyticsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Package,
  ShoppingBag,
  MessageSquare,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import type { Product } from "@/lib/google";
import { formatUsd } from "@/lib/currency";

interface SummaryCounters {
  requestsPending: number;
  ordersPending: number;
  ordersRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [counters, setCounters] = useState<SummaryCounters>({
    requestsPending: 0,
    ordersPending: 0,
    ordersRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, requestsRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/requests"),
        fetch("/api/admin/orders"),
      ]);

      const [pd, rd, od] = await Promise.all([
        productsRes.json(),
        requestsRes.json(),
        ordersRes.json(),
      ]);

      if (pd.success) setProducts(pd.products ?? []);

      const requests: Array<{ status: string }> = rd.success ? rd.requests : [];
      const orders: Array<{ status: string; totalAmount: number }> = od.success
        ? od.orders
        : [];

      setCounters({
        requestsPending: requests.filter((r) => r.status === "pending").length,
        ordersPending: orders.filter((o) => o.status === "pending").length,
        ordersRevenue: orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.replace("/admin/login?callbackUrl=/admin");
      return;
    }
    if (status === "authenticated" && isAdmin) loadDashboard();
  }, [status, isAdmin, router, loadDashboard]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-700" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-neutral-700" />
            <div>
              <h1 className="text-xl font-semibold leading-none">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {session?.user?.name ?? session?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Storefront</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" /> Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">
                {products.filter((p) => p.featured).length} featured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {counters.requestsPending}
              </p>
              <Link
                href="/admin/requests"
                className="text-xs text-blue-600 hover:underline"
              >
                View all requests →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {counters.ordersPending}
              </p>
              <Link
                href="/admin/orders"
                className="text-xs text-blue-600 hover:underline"
              >
                View all orders →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">
                {formatUsd(counters.ordersRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setAdminOpen(true)}>
            <Package className="mr-2 h-4 w-4" /> Manage Products
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/requests">
              <MessageSquare className="mr-2 h-4 w-4" /> Requests
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/orders">
              <ShoppingBag className="mr-2 h-4 w-4" /> Orders
            </Link>
          </Button>
        </div>

        {/* Catalog analytics */}
        {products.length > 0 && (
          <CatalogAnalyticsPanel products={products} />
        )}
      </main>

      <AdminPanel
        open={adminOpen}
        onOpenChange={setAdminOpen}
        products={products}
        onRefresh={loadDashboard}
      />
    </div>
  );
}
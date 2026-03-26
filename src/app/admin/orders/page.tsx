"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Trash2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  items: string;
  totalAmount: number;
  status: string;
  note: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-violet-100 text-violet-800 border-violet-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function parseItems(raw: string): string {
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .map((item: Record<string, unknown>) =>
          item.name ? `${item.qty ?? 1}× ${item.name}` : String(item)
        )
        .join(", ");
    }
    return raw;
  } catch {
    return raw;
  }
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    items: "",
    totalAmount: "",
    note: "",
  });

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      toast({ title: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !isAdmin)
    ) {
      router.replace("/admin/login?callbackUrl=/admin/orders");
      return;
    }
    if (status === "authenticated" && isAdmin) fetchOrders();
  }, [status, isAdmin, router, fetchOrders]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        toast({ title: "Status updated" });
      } else {
        toast({ title: "Failed to update", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast({ title: "Order deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const logOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.items) {
      toast({ title: "Name, phone and items are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const itemsJson = JSON.stringify(
        form.items.split(",").map((s) => ({ name: s.trim(), qty: 1 }))
      );
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail || null,
          items: itemsJson,
          totalAmount: parseFloat(form.totalAmount) || 0,
          note: form.note || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => [data.order, ...prev]);
        setForm({ customerName: "", customerPhone: "", customerEmail: "", items: "", totalAmount: "", note: "" });
        setDialogOpen(false);
        toast({ title: "Order logged" });
      } else {
        toast({ title: "Failed to save order", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to save order", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-700" />
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === "pending").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const total = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 min-h-16 py-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-[180px]">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Orders
            </h1>
            <p className="text-xs text-muted-foreground">
              {orders.length} total &middot; {pending} pending
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Log Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log New Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={logOrder} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="o-name">Customer Name *</Label>
                    <Input
                      id="o-name"
                      value={form.customerName}
                      onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-phone">Phone *</Label>
                    <Input
                      id="o-phone"
                      value={form.customerPhone}
                      onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                      placeholder="+1 555 0000"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="o-email">Email</Label>
                  <Input
                    id="o-email"
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="o-items">
                    Items <span className="text-muted-foreground text-xs">(comma-separated)</span> *
                  </Label>
                  <Input
                    id="o-items"
                    value={form.items}
                    onChange={(e) => setForm((f) => ({ ...f, items: e.target.value }))}
                    placeholder="Blue T-Shirt, Black Jeans"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="o-total">Total Amount (K)</Label>
                  <Input
                    id="o-total"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalAmount}
                    onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="o-note">Note</Label>
                  <Textarea
                    id="o-note"
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="Delivery instructions, size notes…"
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Order
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* KPI summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold text-amber-600">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold text-green-600">{delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">
                K{total.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6">
                No orders yet. Use &ldquo;Log Order&rdquo; to manually record customer orders.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <p className="text-sm truncate text-muted-foreground max-w-[140px] sm:max-w-[180px]">
                            {parseItems(order.items)}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {order.totalAmount > 0 ? `K${order.totalAmount.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateStatus(order.id, v)}
                            disabled={updating === order.id}
                          >
                            <SelectTrigger className="w-32 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  <Badge
                                    variant="outline"
                                    className={`${STATUS_STYLES[s]} text-xs font-medium`}
                                  >
                                    {s}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="max-w-[140px]">
                          <p className="text-xs text-muted-foreground truncate">
                            {order.note ?? "—"}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
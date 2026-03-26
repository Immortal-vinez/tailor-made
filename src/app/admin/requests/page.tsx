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
import { ArrowLeft, Loader2, MessageSquare, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequestRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  productId: string | null;
  productName: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["pending", "replied", "closed"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  replied: "bg-blue-100 text-blue-800 border-blue-200",
  closed: "bg-green-100 text-green-800 border-green-200",
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch {
      toast({ title: "Failed to load requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !isAdmin)
    ) {
      router.replace("/admin/login?callbackUrl=/admin/requests");
      return;
    }
    if (status === "authenticated" && isAdmin) fetchRequests();
  }, [status, isAdmin, router, fetchRequests]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
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

  const deleteRequest = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Request deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-700" />
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending").length;
  const replied = requests.filter((r) => r.status === "replied").length;
  const closed = requests.filter((r) => r.status === "closed").length;

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
              <MessageSquare className="h-5 w-5" /> Customer Requests
            </h1>
            <p className="text-xs text-muted-foreground">
              {requests.length} total &middot; {pending} pending
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Status summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Pending", count: pending, cls: "text-amber-600" },
            { label: "Replied", count: replied, cls: "text-blue-600" },
            { label: "Closed", count: closed, cls: "text-green-600" },
          ].map(({ label, count, cls }) => (
            <Card key={label}>
              <CardContent className="pt-5">
                <p className={`text-2xl font-bold ${cls}`}>{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6">
                No requests yet. They will appear here when customers submit enquiries.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{req.customerName}</p>
                          <p className="text-xs text-muted-foreground">{req.customerPhone}</p>
                        </TableCell>
                        <TableCell>
                          {req.productName ? (
                            <span className="text-sm block max-w-[140px] sm:max-w-[200px] truncate">{req.productName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm truncate text-muted-foreground">
                            {req.message ?? "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={req.status}
                            onValueChange={(v) => updateStatus(req.id, v)}
                            disabled={updating === req.id}
                          >
                            <SelectTrigger className="w-28 h-7 text-xs">
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
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={() => deleteRequest(req.id)}
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
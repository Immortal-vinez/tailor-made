"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Star, TrendingUp } from "lucide-react";
import type { Product } from "@/lib/google";
import { formatUsd } from "@/lib/currency";

interface CatalogAnalyticsPanelProps {
  products: Product[];
}

const CATEGORY_COLORS: Record<string, string> = {
  men: "#1e293b",
  women: "#f43f5e",
  children: "#0d9488",
};

const PRICE_RANGE_COLOR = "#6366f1";

export function CatalogAnalyticsPanel({ products }: CatalogAnalyticsPanelProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No products in catalog yet. Add products to see analytics.
        </CardContent>
      </Card>
    );
  }

  // ── Category counts ──────────────────────────────────────────────────
  const categories = ["men", "women", "children"] as const;
  const categoryData = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: products.filter((p) => p.category === cat).length,
    fill: CATEGORY_COLORS[cat],
  }));

  // ── KPIs ─────────────────────────────────────────────────────────────
  const featuredCount = products.filter((p) => p.featured).length;
  const totalRevenuePotential = products.reduce((s, p) => s + p.price, 0);
  const avgPrice = totalRevenuePotential / products.length;

  const avgPriceByCategory = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const avg =
      catProducts.length > 0
        ? catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length
        : 0;
    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      avgPrice: Math.round(avg * 100) / 100,
    };
  });

  // ── Price range distribution ─────────────────────────────────────────
  const priceRanges = [
    { label: "Under $25", count: products.filter((p) => p.price < 25).length },
    { label: "$25-$50", count: products.filter((p) => p.price >= 25 && p.price < 50).length },
    { label: "$50-$100", count: products.filter((p) => p.price >= 50 && p.price < 100).length },
    { label: "Over $100", count: products.filter((p) => p.price >= 100).length },
  ];

  // ── Catalog health ────────────────────────────────────────────────────
  const noImage = products.filter((p) => !p.imageUrl).length;
  const noSizes = products.filter((p) => p.sizes.length === 0).length;
  const noColors = products.filter((p) => p.colors.length === 0).length;
  const healthIssues = noImage + noSizes + noColors;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Products</p>
            <p className="text-3xl font-bold mt-1">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              <Star className="inline h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
              Featured
            </p>
            <p className="text-3xl font-bold mt-1">{featuredCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Avg Price
            </p>
            <p className="text-3xl font-bold mt-1">{formatUsd(avgPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Catalog Health</p>
            <p className="text-3xl font-bold mt-1">
              {healthIssues === 0 ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-amber-500">{healthIssues} issues</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Products by category – Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                  labelLine={false}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} products`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Avg price by category – Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Price by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={avgPriceByCategory} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatUsd(Number(v))} />
                <Tooltip formatter={(value: number) => [formatUsd(Number(value)), "Avg price"]} />
                <Bar dataKey="avgPrice" radius={[4, 4, 0, 0]}>
                  {avgPriceByCategory.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name.toLowerCase()] ?? "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price range distribution – Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Price Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priceRanges} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(value: number) => [`${value} products`, "Count"]} />
                <Bar dataKey="count" fill={PRICE_RANGE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Catalog health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Catalog Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {[
              { label: "Missing image", count: noImage },
              { label: "No sizes listed", count: noSizes },
              { label: "No colors listed", count: noColors },
            ].map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                {count === 0 ? (
                  <Badge variant="secondary" className="text-green-700 bg-green-50 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    All good
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-amber-700 bg-amber-50 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {count} product{count > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            ))}

            <div className="pt-2 border-t text-xs text-muted-foreground">
              {featuredCount === 0 ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  No featured product set — hero section will be empty
                </span>
              ) : (
                <span className="text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {featuredCount} featured product{featuredCount > 1 ? "s" : ""} active
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

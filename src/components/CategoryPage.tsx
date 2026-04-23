"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/types/product";

const WHATSAPP_NUMBER = "1234567890";

interface CategoryPageProps {
  category: "men" | "women" | "children";
  title: string;
  subtitle: string;
}

const categoryStyles = {
  men: {
    gradient: "from-slate-900 via-slate-800 to-slate-700",
    bg: "bg-slate-50",
    accent: "text-slate-900",
    border: "border-slate-200",
    heroImage: "/images/men-1.jpg",
    heroOverlay: "from-slate-900/80 via-slate-900/50 to-slate-900/20",
    titleText: "text-white",
    subtitleText: "text-slate-200",
    badgeBorder: "border-white/30",
  },
  women: {
    gradient: "from-rose-400 via-pink-400 to-rose-300",
    bg: "bg-rose-50/30",
    accent: "text-rose-600",
    border: "border-rose-100",
    heroImage: "/images/woman-1.jpg",
    heroOverlay: "from-rose-900/80 via-rose-900/50 to-rose-900/20",
    titleText: "text-white",
    subtitleText: "text-rose-100",
    badgeBorder: "border-white/30",
  },
  children: {
    gradient: "from-teal-500 via-cyan-400 to-teal-400",
    bg: "bg-teal-50/30",
    accent: "text-teal-600",
    border: "border-teal-100",
    heroImage: "/images/kids-1.jpg",
    heroOverlay: "from-teal-900/80 via-teal-900/50 to-teal-900/20",
    titleText: "text-white",
    subtitleText: "text-teal-100",
    badgeBorder: "border-white/30",
  },
};

const categorySizes = {
  men: ["XS", "S", "M", "L", "XL", "XXL"],
  women: ["XS", "S", "M", "L", "XL", "XXL"],
  children: ["2T", "3T", "4T", "5", "6", "7", "8", "10", "12"],
};

const categoryColors = {
  men: ["Black", "Navy", "Gray", "White", "Charcoal", "Olive"],
  women: ["Black", "White", "Rose", "Navy", "Beige", "Burgundy", "Sage"],
  children: ["Blue", "Pink", "Yellow", "Green", "Orange", "Purple", "White"],
};

export function CategoryPage({ category, title, subtitle }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const styles = categoryStyles[category];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchQuery("");
  };

  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(query) &&
        !product.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Size filter
    if (selectedSizes.length > 0) {
      if (!selectedSizes.some((size) => product.sizes.includes(size))) {
        return false;
      }
    }

    // Color filter
    if (selectedColors.length > 0) {
      if (!selectedColors.some((color) => product.colors.includes(color))) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters = searchQuery || selectedSizes.length > 0 || selectedColors.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-neutral-900" />
          <p className="mt-4 text-muted-foreground">Loading {title} collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative py-20 md:py-32 overflow-hidden"
          style={{
            backgroundImage: `url(${styles.heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${styles.heroOverlay}`} />

          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className={`mb-4 ${styles.badgeBorder} text-white bg-white/10 backdrop-blur`}>
                {title} Collection
              </Badge>
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${styles.titleText} drop-shadow-lg`}>
                {title}
              </h1>
              <p className={`text-lg ${styles.subtitleText} mt-4 drop-shadow`}>{subtitle}</p>
            </div>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {selectedSizes.length + selectedColors.length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-8 p-6 rounded-xl border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filter Products</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="mr-1 h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sizes */}
                  <div>
                    <p className="text-sm font-medium mb-3">Sizes</p>
                    <div className="flex flex-wrap gap-2">
                      {categorySizes[category].map((size) => (
                        <Badge
                          key={size}
                          variant={selectedSizes.includes(size) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <p className="text-sm font-medium mb-3">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryColors[category].map((color) => (
                        <Badge
                          key={color}
                          variant={selectedColors.includes(color) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleColor(color)}
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {selectedSizes.map((size) => (
                  <Badge key={size} variant="secondary" className="gap-1">
                    Size: {size}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleSize(size)}
                    />
                  </Badge>
                ))}
                {selectedColors.map((color) => (
                  <Badge key={color} variant="secondary" className="gap-1">
                    Color: {color}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleColor(color)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProducts.length} of {products.length} products
            </p>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={WHATSAPP_NUMBER}
                    variant={category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer whatsappNumber={WHATSAPP_NUMBER} />
    </div>
  );
}

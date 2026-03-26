"use client";

import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Product } from "@/lib/google";

interface CategorySectionProps {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
  whatsappNumber: string;
  variant: "men" | "women" | "children";
}

const categoryStyles = {
  men: {
    gradient: "from-slate-900 via-slate-800 to-slate-700",
    accent: "text-slate-900",
    bg: "bg-slate-50",
    border: "border-slate-200",
    highlight: "bg-slate-900",
    pattern: "from-slate-100/50 to-transparent",
    hoverBg: "hover:bg-slate-900",
    heroImage: "/images/men-1.jpg",
    heroOverlay: "from-slate-900/80 via-slate-900/50 to-transparent",
    badgeBg: "bg-white/10 border-white/30",
    badgeText: "text-white",
    titleText: "text-white",
    subtitleText: "text-slate-200",
  },
  women: {
    gradient: "from-rose-400 via-pink-400 to-rose-300",
    accent: "text-rose-600",
    bg: "bg-rose-50/30",
    border: "border-rose-100",
    highlight: "bg-rose-500",
    pattern: "from-rose-100/50 to-transparent",
    hoverBg: "hover:bg-rose-500",
    heroImage: "/images/woman-1.jpg",
    heroOverlay: "from-rose-900/70 via-rose-800/40 to-transparent",
    badgeBg: "bg-white/10 border-white/30",
    badgeText: "text-white",
    titleText: "text-white",
    subtitleText: "text-rose-100",
  },
  children: {
    gradient: "from-teal-500 via-cyan-400 to-teal-400",
    accent: "text-teal-600",
    bg: "bg-teal-50/30",
    border: "border-teal-100",
    highlight: "bg-teal-500",
    pattern: "from-teal-100/50 to-transparent",
    hoverBg: "hover:bg-teal-500",
    heroImage: "/images/kids-1.jpg",
    heroOverlay: "from-teal-900/70 via-teal-800/40 to-transparent",
    badgeBg: "bg-white/10 border-white/30",
    badgeText: "text-white",
    titleText: "text-white",
    subtitleText: "text-teal-100",
  },
};

const categoryLinks = {
  men: "/men",
  women: "/women",
  children: "/children",
};

export function CategorySection({
  id,
  title,
  subtitle,
  products,
  whatsappNumber,
  variant,
}: CategorySectionProps) {
  const styles = categoryStyles[variant];
  const link = categoryLinks[variant];

  return (
    <section id={id} className={`${styles.bg}`}>
      {/* Hero Banner with background image */}
      <div
        className="relative w-full h-64 md:h-80 overflow-hidden"
        style={{
          backgroundImage: `url(${styles.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${styles.heroOverlay}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${styles.badgeBg} backdrop-blur mb-4`}>
            <Sparkles className={`h-4 w-4 ${styles.badgeText}`} />
            <span className={`text-sm font-medium ${styles.badgeText}`}>
              {title} Collection
            </span>
          </div>
          <h2 className={`text-3xl md:text-5xl font-bold ${styles.titleText} drop-shadow-lg`}>
            {title}
          </h2>
          <p className={`${styles.subtitleText} mt-3 max-w-2xl mx-auto text-sm md:text-base drop-shadow`}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={whatsappNumber}
                  variant={variant}
                />
              ))}
            </div>

            {/* View All Button */}
            {products.length >= 4 && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  className={`gap-2 ${styles.border} ${styles.accent} ${styles.hoverBg} hover:text-white transition-colors`}
                  asChild
                >
                  <Link href={link}>
                    View All {title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${styles.bg} ${styles.border} border mb-4`}>
              <span className="text-4xl">
                {variant === "men" ? "👔" : variant === "women" ? "👗" : "🧒"}
              </span>
            </div>
            <p className="text-muted-foreground">
              No products in this category yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

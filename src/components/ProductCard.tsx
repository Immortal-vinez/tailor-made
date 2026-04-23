"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Eye } from "lucide-react";
import type { Product } from "@/types/product";
import { formatUsd } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  variant?: "men" | "women" | "children";
}

const categoryColors = {
  men: {
    bg: "bg-slate-900",
    text: "text-slate-900",
    border: "border-slate-200",
    badge: "bg-slate-900 text-white",
    hover: "hover:border-slate-400",
    accent: "bg-slate-100",
  },
  women: {
    bg: "bg-rose-400",
    text: "text-rose-600",
    border: "border-rose-100",
    badge: "bg-rose-100 text-rose-700",
    hover: "hover:border-rose-300",
    accent: "bg-rose-50",
  },
  children: {
    bg: "bg-teal-500",
    text: "text-teal-600",
    border: "border-teal-100",
    badge: "bg-teal-100 text-teal-700",
    hover: "hover:border-teal-300",
    accent: "bg-teal-50",
  },
};

export function ProductCard({ product, whatsappNumber, variant = "men" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const colors = categoryColors[variant];
  
  const whatsappMessage = encodeURIComponent(
    `Hi! I'm interested in ${product.name} - ${formatUsd(product.price)}. Sizes available: ${product.sizes.join(", ") || "N/A"}. Colors: ${product.colors.join(", ") || "N/A"}. Can you provide more details?`
  );
  
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <Card
      className={`group relative overflow-hidden border-2 ${colors.border} ${colors.hover} transition-all duration-300 ${
        isHovered ? "shadow-xl scale-[1.02]" : "shadow-md"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${colors.accent}`}>
            <span className="text-6xl opacity-50">👔</span>
          </div>
        )}

        {/* Overlay Actions */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white"
            asChild
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Eye className="h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* Featured Badge */}
        {product.featured && (
          <Badge className={`absolute top-3 left-3 ${colors.bg} text-white`}>
            Featured
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className={`mb-2 ${colors.badge}`}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Badge>
            <h3 className="font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>
          <p className={`text-sm sm:text-lg font-bold whitespace-nowrap shrink-0 ${colors.text}`}>
            {formatUsd(product.price)}
          </p>
        </div>

        {/* Sizes & Colors */}
        <div className="mt-3 flex flex-wrap gap-1">
          {product.sizes.slice(0, 4).map((size) => (
            <Badge key={size} variant="secondary" className="text-xs">
              {size}
            </Badge>
          ))}
          {product.sizes.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{product.sizes.length - 4}
            </Badge>
          )}
        </div>

        {/* WhatsApp Button */}
        <Button
          className={`w-full mt-4 bg-green-600 hover:bg-green-700 text-white gap-2`}
          asChild
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Contact on WhatsApp
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

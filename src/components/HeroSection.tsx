"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star } from "lucide-react";
import type { Product } from "@/lib/google";
import { formatUsd } from "@/lib/currency";

interface HeroSectionProps {
  product: Product | null;
  whatsappNumber: string;
}

export function HeroSection({ product, whatsappNumber }: HeroSectionProps) {
  const whatsappMessage = product
    ? encodeURIComponent(
        `Hi! I'm interested in the ${product.name} (${product.category}) - ${formatUsd(product.price)}. Can you provide more details?`
      )
    : encodeURIComponent("Hi! I'm interested in your products.");

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="home" className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-amber-100 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-rose-100 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <Badge variant="outline" className="w-fit mx-auto lg:mx-0 bg-white/50 backdrop-blur">
              <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
              Featured Collection
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Where Style Meets{" "}
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-transparent">
                Expression
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Discover fashion that speaks to your unique personality. Quality clothing for men, women, and children — all in one place.
            </p>

            {product && (
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Badge variant="secondary" className="text-sm py-1.5">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Badge>
                {product.sizes.length > 0 && (
                  <Badge variant="outline" className="text-sm py-1.5">
                    Sizes: {product.sizes.join(", ")}
                  </Badge>
                )}
                {product.colors.length > 0 && (
                  <Badge variant="outline" className="text-sm py-1.5">
                    Colors: {product.colors.join(", ")}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                asChild
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Contact on WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#men">Explore Collection</a>
              </Button>
            </div>

            {product && (
              <div className="mt-6 p-4 rounded-xl bg-white/60 backdrop-blur border max-w-md mx-auto lg:mx-0">
                <p className="text-sm text-muted-foreground">Featured: {product.name}</p>
                <p className="text-2xl font-bold text-foreground">{formatUsd(product.price)}</p>
              </div>
            )}
          </div>

          {/* Product Image */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-200 to-neutral-300 shadow-2xl">
              <img
                src={product?.imageUrl || "/images/woman-hero.jpg"}
                alt={product?.name || "Oneway Fashion"}
                className="h-full w-full object-cover"
              />
              
              {/* Floating Badge */}
              {product && (
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold whitespace-nowrap shrink-0">{formatUsd(product.price)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-amber-200/50 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-rose-200/50 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

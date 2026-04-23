"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product";

// WhatsApp number - change this to your actual number (without + or spaces)
const WHATSAPP_NUMBER = "260968570833";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const menProducts = products.filter((p) => p.category === "men");
  const womenProducts = products.filter((p) => p.category === "women");
  const childrenProducts = products.filter((p) => p.category === "children");
  const featuredProduct =
    products.find((p) => p.id === "women-1") ||
    products.find((p) => p.featured) ||
    products[0] ||
    null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-neutral-900" />
          <p className="mt-4 text-muted-foreground">Loading Nyembo Designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <HeroSection product={featuredProduct} whatsappNumber={WHATSAPP_NUMBER} />
        
        <CategorySection
          id="men"
          title="Men"
          subtitle="Discover our collection of stylish and comfortable men's clothing. From casual to formal, find the perfect fit for every occasion."
          products={menProducts}
          whatsappNumber={WHATSAPP_NUMBER}
          variant="men"
        />
        
        <CategorySection
          id="women"
          title="Women"
          subtitle="Explore our elegant women's collection featuring the latest trends in fashion. Quality pieces that express your unique style."
          products={womenProducts}
          whatsappNumber={WHATSAPP_NUMBER}
          variant="women"
        />
        
        <CategorySection
          id="children"
          title="Children"
          subtitle="Fun, comfortable, and durable clothing for your little ones. Bright colors and playful designs they'll love to wear."
          products={childrenProducts}
          whatsappNumber={WHATSAPP_NUMBER}
          variant="children"
        />
      </main>
      
      <Footer whatsappNumber={WHATSAPP_NUMBER} />
    </div>
  );
}

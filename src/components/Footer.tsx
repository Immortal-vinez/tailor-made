"use client";

import Link from "next/link";
import { Shirt, MessageCircle, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  whatsappNumber: string;
}

export function Footer({ whatsappNumber }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Men", href: "/men" },
    { label: "Women", href: "/women" },
    { label: "Children", href: "/children" },
    { label: "About", href: "/about" },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <Shirt className="h-5 w-5 text-neutral-900" />
              </div>
              <span className="text-xl font-bold tracking-tight">ONEWAY</span>
            </Link>
            <p className="text-neutral-400 max-w-md">
              Your destination for quality fashion. Discover stylish clothing for men, women, 
              and children. Express yourself with Oneway.
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                size="icon"
                variant="ghost"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                asChild
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-0 text-neutral-400 hover:text-white hover:bg-transparent"
                  asChild
                >
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-neutral-800" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <p>&copy; {currentYear} Oneway. All rights reserved.</p>
          <p>Quality fashion for everyone</p>
        </div>
      </div>
    </footer>
  );
}

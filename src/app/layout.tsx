import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyembo Designs - Fashion for Everyone",
  description: "Discover quality fashion for men, women, and children at Nyembo Designs. Express yourself with our stylish clothing collection.",
  keywords: ["Nyembo Designs", "Fashion", "Men Clothing", "Women Clothing", "Children Clothing", "Style", "Trending"],
  authors: [{ name: "Nyembo Designs" }],
  other: {
    "darkreader-lock": "",
  },
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Nyembo Designs - Fashion for Everyone",
    description: "Discover quality fashion for men, women, and children at Nyembo Designs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

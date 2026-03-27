"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, Shirt, LayoutDashboard, LogOut, User } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";
  const isCustomer = status === "authenticated" && !isAdmin;
  const isGuest = status !== "loading" && !session;

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Men", href: "/men" },
    { label: "Women", href: "/women" },
    { label: "Children", href: "/children" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700">
            <Shirt className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ONEWAY</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right-side actions — three exclusive states */}
        <div className="flex items-center gap-2">
          {status !== "loading" && (
            <>
              {/* ── ADMIN: Dashboard + Log Out ── */}
              {isAdmin && (
                <>
                  <Button variant="outline" asChild className="hidden md:flex">
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    aria-label="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* ── CUSTOMER: My Account + Log Out (NO Dashboard ever) ── */}
              {isCustomer && (
                <>
                  <Button variant="outline" size="sm" asChild className="hidden md:flex">
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      {session?.user?.name?.split(" ")[0] ?? "My Account"}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    aria-label="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* ── GUEST: Sign In ── */}
              {isGuest && (
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 pt-8">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">ONEWAY</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Mobile: ADMIN */}
                  {isAdmin && (
                    <>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href="/admin" onClick={() => setIsOpen(false)}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/" }); }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  )}

                  {/* Mobile: CUSTOMER — NO Dashboard ever */}
                  {isCustomer && (
                    <>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href="/account" onClick={() => setIsOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          {session?.user?.name?.split(" ")[0] ?? "My Account"}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/" }); }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  )}

                  {/* Mobile: GUEST */}
                  {isGuest && (
                    <Button className="mt-4" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


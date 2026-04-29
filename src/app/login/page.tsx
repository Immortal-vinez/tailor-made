"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff } from "lucide-react";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const { data: session, status } = useSession();

  // --- redirect if already logged in ---
  useEffect(() => {
    if (status === "authenticated") {
      const dest =
        session?.user?.isAdmin === true || session?.user?.role === "admin"
          ? "/admin"
          : "/account";
      router.replace(dest);
    }
  }, [status, session, router]);

  // ─── Sign In state ───────────────────────────────────────────────
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInEmailError, setSignInEmailError] = useState<string | null>(null);
  const [showSignInPw, setShowSignInPw] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignInEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignInEmail(value);
    if (value && !validateEmail(value)) {
      setSignInEmailError("Please enter a valid email address.");
    } else {
      setSignInEmailError(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    if (signInEmailError) {
      setSignInError("Please correct the email address.");
      return;
    }

    setSignInLoading(true);

    const result = await signIn("customer", {
      email: signInEmail.trim().toLowerCase(),
      password: signInPassword,
      redirect: false,
      callbackUrl,
    });

    setSignInLoading(false);

    if (result?.error) {
      setSignInError("Incorrect email or password. Please try again.");
      return;
    }

    router.replace(callbackUrl);
  };

  // ─── Register state ──────────────────────────────────────────────
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regEmailError, setRegEmailError] = useState<string | null>(null);
  const [showRegPw, setShowRegPw] = useState(false);

  const handleRegEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegEmail(value);
    if (value && !validateEmail(value)) {
      setRegEmailError("Please enter a valid email address.");
    } else {
      setRegEmailError(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regEmailError) {
      setRegError("Please correct the email address.");
      return;
    }

    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters.");
      return;
    }

    setRegLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        phone: regPhone.trim() || undefined,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setRegLoading(false);
      setRegError(data.error || "Registration failed.");
      return;
    }

    // Auto sign-in after successful registration
    const signResult = await signIn("customer", {
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      redirect: false,
      callbackUrl: "/account",
    });

    setRegLoading(false);

    if (signResult?.error) {
      setRegError("Account created! Please sign in.");
      return;
    }

    router.replace("/account");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 group"
      >
        <Image src="/logo.png" alt="Nyembo Designs" width={44} height={44} className="rounded-full" />
        <span className="text-2xl font-bold tracking-tight text-neutral-900">
          Nyembo Designs
        </span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-neutral-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Tabs defaultValue="signin">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="signin" className="flex-1">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* ─── Sign In ─────────────────────────────────── */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={signInEmail}
                    onChange={handleSignInEmailChange}
                  />
                </div>

                {signInEmailError && (
                  <p className="text-sm text-red-600">{signInEmailError}</p>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="si-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="si-password"
                      type={showSignInPw ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPw((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showSignInPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {signInError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {signInError}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={signInLoading}>
                  {signInLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>

                <p className="text-right text-sm">
                  <Link href="/forgot-password" className="text-muted-foreground underline underline-offset-2 hover:text-foreground">
                    Forgot password?
                  </Link>
                </p>
              </form>
            </TabsContent>

            {/* ─── Register ────────────────────────────────── */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={regEmail}
                    onChange={handleRegEmailChange}
                  />
                </div>

                {regEmailError && (
                  <p className="text-sm text-red-600">{regEmailError}</p>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="reg-phone">
                    Phone{" "}
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="+1 555 000 0000"
                    autoComplete="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showRegPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                  />
                </div>

                {regError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {regError}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={regLoading}>
                  {regLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-foreground">
              terms of service
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-neutral-700" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

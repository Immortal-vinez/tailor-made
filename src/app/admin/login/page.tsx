"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";

function AdminLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin =
    session?.user?.isAdmin === true || session?.user?.role === "admin";

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      router.replace(callbackUrl);
    }
  }, [status, isAdmin, callbackUrl, router]);

  const handleCredentialsLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (result?.error) {
      setError("Invalid credentials or missing admin configuration.");
      return;
    }

    router.replace(callbackUrl);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    await signIn("google", { callbackUrl });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-xl border-neutral-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-neutral-700 mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Admin Access</span>
          </div>
          <CardTitle>Sign in to Dashboard</CardTitle>
          <CardDescription>
            Use admin credentials or approved Google account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with credentials"
              )}
            </Button>
          </form>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>

          <Button type="button" variant="ghost" className="w-full" asChild>
            <Link href="/">Back to storefront</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <AdminLoginPageInner />
    </Suspense>
  );
}
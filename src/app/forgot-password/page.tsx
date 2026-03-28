"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Could not process your request.");
      } else {
        setMessage(data.message || "If an account exists for that email, a reset link has been generated.");
        if (data.resetUrl) setDevResetUrl(data.resetUrl);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 shadow-md">
          <Shirt className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-neutral-900">ONEWAY</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-neutral-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email and we will generate a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                {message}
              </p>
            )}

            {devResetUrl && (
              <p className="text-xs break-all text-muted-foreground bg-neutral-100 rounded-md px-3 py-2">
                Dev reset link: <a className="underline" href={devResetUrl}>{devResetUrl}</a>
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password? <Link className="underline" href="/login">Back to sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
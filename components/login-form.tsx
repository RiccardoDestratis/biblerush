"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login, sendMagicLink } from "@/app/login/actions";
import { Key, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic-link">("magic-link");

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome to BibleRush</CardTitle>
        <CardDescription>
          Sign in to create games or manage your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "magic-link" ? (
          <>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  We'll send you a magic link to log in without a password.
                </p>
              </div>
              <Button formAction={sendMagicLink} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </Button>
            </form>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("password")}
                className="text-sm"
              >
                <Key className="mr-2 h-4 w-4" />
                Use password instead
              </Button>
            </div>
          </>
        ) : (
          <>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button formAction={login} className="w-full">
                Log in
              </Button>
            </form>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("magic-link")}
                className="text-sm"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Use magic link instead
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


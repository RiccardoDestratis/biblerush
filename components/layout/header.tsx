"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Gamepad2, TestTube, Database, LayoutDashboard } from "lucide-react";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create Game", icon: Gamepad2 },
  { href: "/test-components", label: "Test Components", icon: TestTube },
  { href: "/test-supabase", label: "Test Supabase", icon: Database },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">BibleRush</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "gap-2",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


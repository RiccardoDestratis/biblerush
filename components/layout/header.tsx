"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Home, Gamepad2, LayoutDashboard, Wrench, TestTube, Database } from "lucide-react";
import { useGameStore } from "@/lib/store/game-store";

const mainNavigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create Game", icon: Gamepad2 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const developmentTools = [
  { href: "/test-components", label: "Test Components", icon: TestTube },
  { href: "/test-supabase", label: "Test Supabase", icon: Database },
];

export function Header() {
  const pathname = usePathname();
  const { gameStatus } = useGameStore();

  const isDevToolActive = developmentTools.some((tool) => pathname === tool.href);
  
  // Hide header when game is active (both host and player views)
  const isGameActive = gameStatus === "active";
  const isGamePage = pathname?.startsWith("/game/");
  
  if (isGamePage && isGameActive) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-4xl">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">BibleRush</span>
        </Link>
        <nav className="flex items-center gap-2">
          {mainNavigation.map((item) => {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isDevToolActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  isDevToolActive && "bg-primary text-primary-foreground"
                )}
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Dev Tools</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {developmentTools.map((tool) => {
                const ToolIcon = tool.icon;
                const isActive = pathname === tool.href;
                return (
                  <DropdownMenuItem key={tool.href} asChild>
                    <Link
                      href={tool.href}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isActive && "bg-accent"
                      )}
                    >
                      <ToolIcon className="h-4 w-4" />
                      <span>{tool.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}


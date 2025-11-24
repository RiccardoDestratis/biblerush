"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, LogIn, UserPlus } from "lucide-react";
import { useGameStore } from "@/lib/store/game-store";

export function Header() {
  const pathname = usePathname();
  const { gameStatus } = useGameStore();
  
  // Hide header when game is active (both host and player views)
  const isGameActive = gameStatus === "active" || gameStatus === "ended";
  const isGamePage = pathname?.startsWith("/game/");
  
  // Completely hide header during active game
  if (isGamePage && isGameActive) {
    return null;
  }

  // TODO: When authentication is implemented, check auth state here
  // For now, show auth buttons for all users
  const isAuthenticated = false; // This will be replaced with actual auth check

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">BibleRush</span>
        </Link>
        <nav className="flex items-center gap-2">
          {/* Unauthenticated navigation - show minimal links */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          
          {/* Auth buttons - shown for unauthenticated users */}
          <div className="flex items-center gap-2 ml-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/signup">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}


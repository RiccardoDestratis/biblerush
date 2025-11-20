import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base styling
      "rounded-xl border bg-card text-card-foreground",
      // Game-like 3D effects: Always visible depth (mobile-first, no hover required)
      // Multiple shadow layers for dramatic depth that works on mobile
      "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.12),0_2px_4px_-1px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]",
      // Gradient background for game-like feel (always visible, not hover-dependent)
      "bg-gradient-to-br from-card via-card to-card/95",
      // Touch/Active state: Pressed effect (important for mobile)
      "transition-all duration-150 active:translate-y-0.5 active:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.06)]",
      // Hover effect: Desktop enhancement (optional, mobile doesn't use)
      "hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.12),0_4px_6px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:-translate-y-0.5",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

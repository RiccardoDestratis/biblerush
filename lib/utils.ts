import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Typography utilities for consistent text sizing
 * Following UX Design Specification for projector and mobile optimization
 */

/**
 * Projector text utilities
 * Optimized for large displays (1920x1080) viewed from 20+ feet away
 */
export const projectorText = {
  heading: "text-[48px] leading-tight font-bold",
  body: "text-[32px] leading-relaxed",
  small: "text-[24px] leading-normal",
} as const

/**
 * Mobile text utilities
 * Optimized for phone screens (375px-430px) with touch-first design
 */
export const mobileText = {
  heading: "text-[24px] leading-tight font-bold",
  body: "text-[18px] leading-relaxed",
  small: "text-[16px] leading-normal",
} as const

/**
 * Helper function to get responsive text classes
 * @param variant - Text variant (heading, body, small)
 * @param breakpoint - 'projector' for large displays, 'mobile' for phones, 'auto' for responsive
 */
export function getTextSize(
  variant: "heading" | "body" | "small",
  breakpoint: "projector" | "mobile" | "auto" = "auto"
): string {
  if (breakpoint === "projector") {
    return projectorText[variant]
  }
  if (breakpoint === "mobile") {
    return mobileText[variant]
  }
  // Auto: mobile by default, projector on large screens
  const mobile = mobileText[variant]
  const projector = projectorText[variant]
  return `${mobile} md:${projector.split(" ")[0]}`
}

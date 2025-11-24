import type { UserTier } from "./user";

/**
 * Check if a user has access to a question set based on tier_required
 * This is a pure function that can be used on both client and server
 */
export function hasAccessToTier(
  userTier: UserTier | null,
  requiredTier: "free" | "pro" | "church" | "sub"
): boolean {
  // Free tier is always accessible
  if (requiredTier === "free") {
    return true;
  }

  // No user tier data - no access to paid tiers
  if (!userTier || !userTier.isAuthenticated || !userTier.tier) {
    return false;
  }

  // Tier hierarchy: free < pro < church/sub
  // Users with higher tiers can access lower tier content
  const tierHierarchy: Record<string, number> = {
    free: 0,
    pro: 1,
    sub: 2,
    church: 2,
  };

  const userTierLevel = tierHierarchy[userTier.tier] ?? 0;
  const requiredTierLevel = tierHierarchy[requiredTier] ?? 0;

  return userTierLevel >= requiredTierLevel;
}


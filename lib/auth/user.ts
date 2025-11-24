"use server";

import { createClient } from "@/lib/supabase/server";

export interface UserTier {
  tier: "free" | "pro" | "church" | "sub" | null;
  isAuthenticated: boolean;
  userId: string | null;
}

/**
 * Get the current user's authentication status and tier
 * Returns null tier if not authenticated
 */
export async function getUserTier(): Promise<UserTier> {
  try {
    const supabase = await createClient();
    
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        tier: null,
        isAuthenticated: false,
        userId: null,
      };
    }

    // Get user's tier from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("tier")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      // User exists in auth but not in users table - treat as free tier
      return {
        tier: "free",
        isAuthenticated: true,
        userId: user.id,
      };
    }

    return {
      tier: (userData.tier as "free" | "pro" | "church" | "sub") || "free",
      isAuthenticated: true,
      userId: user.id,
    };
  } catch (error) {
    console.error("Error getting user tier:", error);
    return {
      tier: null,
      isAuthenticated: false,
      userId: null,
    };
  }
}


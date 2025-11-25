"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ success: true } | { success: false; error: AuthError }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
          tier: "free",
          locale_preference: "en",
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.status?.toString(),
        },
      };
    }

    // The trigger will automatically create a row in public.users
    // No need to manually insert

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: true } | { success: false; error: AuthError }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.status?.toString(),
        },
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}


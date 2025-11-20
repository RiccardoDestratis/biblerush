import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnvVar } from "@/lib/utils/env";

/**
 * Supabase client for server-side usage
 * Use this in Server Components and Server Actions
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Supabase client with service role key for admin operations
 * Use this ONLY in Server Actions that need elevated permissions
 * ⚠️ Never expose the service role key to the client
 * 
 * Note: Service role key is optional - only needed for admin operations
 * or when RLS policies need to be bypassed. For most operations, use createClient() instead.
 */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. " +
      "Get it from: https://supabase.com/dashboard/project/_/settings/api " +
      "(look for 'service_role' key - it's marked as 'secret')"
    );
  }
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  
  return createClient(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey
  );
}


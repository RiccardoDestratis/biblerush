"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getRequestOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXT_PUBLIC_VERCEL_URL || 
         "http://localhost:3000";
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const baseUrl = await getRequestOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`,
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/reset-password?email-sent=true");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;
  const tokenHash = formData.get("token_hash") as string;
  const type = formData.get("type") as string;

  // Verify passwords match
  if (password !== confirmPassword) {
    redirect("/reset-password?error=passwords-dont-match");
  }

  // If token_hash is provided, verify it first
  if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as "recovery",
      token_hash: tokenHash,
    });

    if (verifyError) {
      redirect("/reset-password?error=invalid-token");
    }
  }

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login?password-updated=true");
}


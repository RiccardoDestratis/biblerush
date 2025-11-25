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
  
  // Fallback to environment variables if headers not available
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXT_PUBLIC_VERCEL_URL || 
         "http://localhost:3000";
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/create");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const baseUrl = await getRequestOrigin();
  
  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
      data: {
        display_name: data.email.split("@")[0],
        tier: "free",
        locale_preference: "en",
      },
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/create");
}

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const baseUrl = await getRequestOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
    },
  });

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login?magic-link-sent=true");
}


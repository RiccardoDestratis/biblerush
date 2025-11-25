import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/create";

  // Log the incoming request for debugging
  console.log("[AUTH CONFIRM] Incoming request:", {
    url: request.url,
    token_hash: token_hash ? "present" : "missing",
    code: code ? "present" : "missing",
    type,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  const supabase = await createClient();

  // Handle token_hash flow (for SSR - preferred for magic links)
  // This is the recommended approach for Next.js SSR
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // For recovery, redirect to reset password page with token
      if (type === "recovery") {
        redirectTo.pathname = "/reset-password";
        redirectTo.searchParams.set("token_hash", token_hash);
        redirectTo.searchParams.set("type", type);
        return NextResponse.redirect(redirectTo);
      }
      
      return NextResponse.redirect(redirectTo);
    }
    
    // If verification failed, log error and redirect to error page
    console.error("Token verification failed:", error);
    redirectTo.pathname = "/error";
    return NextResponse.redirect(redirectTo);
  }

  // Handle PKCE flow (code parameter without type - exchange code for session)
  // This is used when email template uses {{ .ConfirmationURL }} (not recommended for SSR)
  if (code && !type) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
    
    // If exchange failed, log error and redirect to error page
    console.error("Code exchange failed:", error);
    redirectTo.pathname = "/error";
    return NextResponse.redirect(redirectTo);
  }

  // Handle email OTP flow (code parameter with type - requires email)
  // Note: For email OTP, we need the email which should be stored in session or passed separately
  // This flow is typically handled client-side, but if needed here, email must be provided
  if (code && type) {
    // For email OTP verification, email is required but not available in URL
    // This should typically be handled client-side where email is known
    console.error("Email OTP flow requires email parameter, which is not available in URL");
    redirectTo.pathname = "/error";
    return NextResponse.redirect(redirectTo);
  }

  // If we get here, there was an error - no valid parameters provided
  console.error("No valid authentication parameters provided");
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}


import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type OtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

const OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const);

function getSafeRedirectPath(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
    }
  } else if (tokenHash && type) {
    if (!OTP_TYPES.has(type as OtpType)) {
      return NextResponse.redirect(new URL("/login?error=auth_verification_failed", request.url));
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as OtpType,
    });

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_verification_failed", request.url));
    }
  }

  const target =
    type === "recovery" || next === "/auth/reset-password" ? "/auth/reset-password" : next;

  return NextResponse.redirect(new URL(target, request.url));
}

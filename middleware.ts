import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isAllowlistedAdminEmail, MAINTENANCE_MODE, PRE_LAUNCH_ENABLED } from "@/lib/env";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // MAINTENANCE MODE: serve the maintenance screen to everyone except admins.
  // /login (so admins can sign in) and /api (auth callbacks, cron) stay open.
  if (
    MAINTENANCE_MODE &&
    !isAllowlistedAdminEmail(user?.email) &&
    !request.nextUrl.pathname.startsWith("/maintenance") &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // PROTECTED ROUTES: If user is NOT logged in, kick them to Login.
  // (Admin + settings were previously client-gated only, which served their
  // shell/bundle to anyone — gate them server-side here like the dashboard.)
  const protectedPrefixes = ["/dashboard", "/onboarding", "/settings", "/admin"];
  if (!user && protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // AUTH ROUTES: If user IS logged in, kick them to Dashboard (don't let them see login/signup)
  if (user && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ADMIN ROUTES: a logged-in non-admin must not reach /admin.
  if (user && request.nextUrl.pathname.startsWith("/admin") && !isAllowlistedAdminEmail(user.email)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // PRE-REGISTRATION GATING
  // If pre_registration_mode is enabled, redirect logged-in non-admin users
  // away from dashboard pages (except edit-profile, settings, etc.) to /pre-launch
  if (PRE_LAUNCH_ENABLED && user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const allowedPreRegPaths = [
      "/dashboard/edit-profile",
      "/dashboard/chat",      // Allow chat for support
    ];
    const isAllowedPath = allowedPreRegPaths.some(p => request.nextUrl.pathname.startsWith(p));

    if (!isAllowedPath && !isAllowlistedAdminEmail(user.email)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL("/pre-launch", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

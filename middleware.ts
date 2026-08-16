import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isAllowlistedAdminEmail, MAINTENANCE_MODE, PRE_LAUNCH_ENABLED } from "@/lib/env";
import { isServed } from "@/lib/geo";

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

  // GEO: we serve the US, Canada and India. Everyone else gets a courteous
  // "not yet" rather than a form for a service that cannot reach them.
  //
  // Deliberately narrow. It never touches /api (cron, auth callbacks, webhooks),
  // never touches a signed-in member — someone who registered while we did serve
  // them must not be locked out by a trip abroad — and an unknown country is
  // treated as served, because a missing geo header is common and turning away a
  // real visitor is the worse error.
  //
  // ?geo=allow sets a cookie that opts back in, so the page is an explanation
  // rather than a wall. Anyone determined enough to click it is someone we want.
  const geoExempt =
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/not-yet-available") ||
    request.nextUrl.pathname.startsWith("/legal") ||
    request.nextUrl.pathname.startsWith("/login");

  if (!user && !geoExempt) {
    if (request.nextUrl.searchParams.get("geo") === "allow") {
      const url = new URL(request.url);
      url.searchParams.delete("geo");
      const pass = NextResponse.redirect(url);
      pass.cookies.set("pravara_geo_ok", "1", { path: "/", maxAge: 60 * 60 * 24 * 180 });
      return pass;
    }

    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry");

    if (!isServed(country) && request.cookies.get("pravara_geo_ok")?.value !== "1") {
      return NextResponse.rewrite(new URL("/not-yet-available", request.url));
    }
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

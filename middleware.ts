import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  // PROTECTED ROUTES: If user is NOT logged in, kick them to Login
  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // AUTH ROUTES: If user IS logged in, kick them to Dashboard (don't let them see login/signup)
  if (user && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // PRE-REGISTRATION GATING
  // If pre_registration_mode is enabled, redirect logged-in non-admin users
  // away from dashboard pages (except edit-profile, settings, etc.) to /pre-launch
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const allowedPreRegPaths = [
      "/dashboard/edit-profile",
      "/dashboard/chat",      // Allow chat for support
    ];
    const isAllowedPath = allowedPreRegPaths.some(p => request.nextUrl.pathname.startsWith(p));
    const isPreLaunch = request.nextUrl.pathname === "/pre-launch";

    if (!isAllowedPath && !isPreLaunch) {
      // Check site_config for pre_registration_mode
      const { data: config } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "pre_registration_mode")
        .single();

      if (config?.value === "true") {
        // Check if user is admin (admins bypass)
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
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

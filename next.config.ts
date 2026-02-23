import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent the page from being embedded in an iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing the content-type (XSS vector)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin when navigating cross-origin, full URL same-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 2 years, include subdomains, eligible for preload list
  // NOTE: Only enable this once your domain is fully on HTTPS/Cloudflare
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  async headers() {
    return [
      {
        // Apply to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      // 1. Your Supabase Project (For real user photos)
      {
        protocol: "https",
        hostname: "ybwltjpsxpimwdttwken.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // 2. Unsplash (For dummy/placeholder photos)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

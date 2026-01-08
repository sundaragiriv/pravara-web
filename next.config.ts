import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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

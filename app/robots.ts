import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/faq", "/legal/privacy", "/legal/terms", "/legal/trust"],
        disallow: [
          "/admin",
          "/api/",
          "/auth/",
          "/dashboard",
          "/dashboard/",
          "/login",
          "/membership",
          "/onboarding",
          "/pre-launch",
          "/settings",
          "/signup",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

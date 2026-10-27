import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Public pages may be crawled; the signed-in app and one-off auth steps may not
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/", "/dashboard", "/farms", "/settings", "/admin", "/onboarding",
        "/verify-email", "/forgot-password", "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

// Public address of the site, used for canonical links, the sitemap and share images.
// Set NEXT_PUBLIC_SITE_URL in production (e.g. https://farmpaisa.com); Netlify's own
// URL variable is the fallback.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "FarmPaisa";

// Open Graph locale for each app language
export const OG_LOCALES: Record<string, string> = { en: "en_IN", hi: "hi_IN", pa: "pa_IN" };

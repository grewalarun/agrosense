import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import NavigationProgress from "@/components/NavigationProgress";
import { OG_LOCALES, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Google tags load only when their IDs are set (e.g. in Netlify's environment variables).
// Use one or the other for Analytics: if GA4 is set up inside the GTM container, leave
// NEXT_PUBLIC_GA_ID empty, or every page view is counted twice.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("meta"), getLocale()]);
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, type: "website", locale: OG_LOCALES[locale] },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  };
}

export const viewport: Viewport = { themeColor: "#166534" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body>
        <NextIntlClientProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </NextIntlClientProvider>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}

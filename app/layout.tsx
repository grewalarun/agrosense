import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroSense – Farm Management",
  description: "Smart farm management platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

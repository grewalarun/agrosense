import type { Metadata } from "next";
import { Suspense } from "react";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroSense – Farm Management",
  description: "Smart farm management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

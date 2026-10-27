import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: `${t("signIn")} – FarmPaisa`, description: t("signInSubtitle"), alternates: { canonical: "/login" } };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

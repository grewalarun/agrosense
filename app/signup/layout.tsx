import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: `${t("createTitle")} – FarmPaisa`, description: t("createSubtitle"), alternates: { canonical: "/signup" } };
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

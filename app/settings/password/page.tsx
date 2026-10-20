import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { getTranslations } from "next-intl/server";
import PasswordForm from "./password-form";

export default async function ChangePasswordPage() {
  const [t, tc] = await Promise.all([getTranslations("password"), getTranslations("common")]);
  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg">
        <BackLink href="/settings" label={tc("backToSettings")} />
        <PasswordForm />
      </main>
    </div>
  );
}

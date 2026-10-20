import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { getMe } from "@/lib/api/account";
import EmailTestForm from "./email-test-form";

export default async function EmailTestPage() {
  const [user, t, tc] = await Promise.all([getMe(), getTranslations("emailTest"), getTranslations("common")]);
  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg">
        <BackLink href="/settings" label={tc("backToSettings")} />
        <EmailTestForm defaultTo={user.email} />
      </main>
    </div>
  );
}

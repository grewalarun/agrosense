import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { getTranslations } from "next-intl/server";
import { getMe } from "@/lib/api/account";
import PasswordForm from "./password-form";

export default async function ChangePasswordPage() {
  const [t, tc, me] = await Promise.all([getTranslations("password"), getTranslations("common"), getMe()]);
  return (
    <div>
      <TopBar title={me.hasPassword === false ? t("setTitle") : t("title")} />
      <main className="p-4 lg:p-6 max-w-lg">
        <BackLink href="/settings" label={tc("backToSettings")} />
        {/* Accounts made with Google have no password until they set one */}
        <PasswordForm hasPassword={me.hasPassword !== false} />
      </main>
    </div>
  );
}

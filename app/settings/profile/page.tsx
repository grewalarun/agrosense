import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { getTranslations } from "next-intl/server";
import { getMe } from "@/lib/api/account";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const [user, t, tc] = await Promise.all([getMe(), getTranslations("profile"), getTranslations("common")]);
  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg">
        <BackLink href="/settings" label={tc("backToSettings")} />
        <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone ?? "" }} />
      </main>
    </div>
  );
}

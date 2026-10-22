import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import ComposeForm from "@/components/admin/ComposeForm";

export default async function NewMessagePage(props: { searchParams: Promise<{ user?: string; name?: string }> }) {
  const { user, name } = await props.searchParams;
  const [t] = await Promise.all([getTranslations("adminMessages")]);
  const initialUser = user && name ? { id: user, name, email: "" } : null;
  return (
    <div>
      <TopBar title={t("newTitle")} />
      <main className="p-4 lg:p-6 max-w-2xl">
        <BackLink href="/admin/messages" label={t("back")} />
        <ComposeForm initialUser={initialUser} />
      </main>
    </div>
  );
}

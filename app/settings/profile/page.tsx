import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { getMe } from "@/lib/api/account";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await getMe();
  return (
    <div>
      <TopBar title="Profile" />
      <main className="p-4 lg:p-6 max-w-lg">
        <BackLink href="/settings" label="Back to Settings" />
        <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone ?? "" }} />
      </main>
    </div>
  );
}

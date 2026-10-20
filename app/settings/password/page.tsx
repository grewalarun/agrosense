import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import PasswordForm from "./password-form";

export default function ChangePasswordPage() {
  return (
    <div>
      <TopBar title="Change password" />
      <main className="p-4 lg:p-6 max-w-lg">
        <BackLink href="/settings" label="Back to Settings" />
        <PasswordForm />
      </main>
    </div>
  );
}

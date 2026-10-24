import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import ResetForm from "./reset-form";

// Reached from /forgot-password with ?id=<reset id>&email=…&wait=<seconds until resend>
export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const { id, email, wait } = await props.searchParams;
  if (typeof id !== "string" || typeof email !== "string") redirect("/forgot-password");

  return (
    <AuthShell>
      <ResetForm resetId={id} email={email} initialWait={Math.min(60, Math.max(0, Number(wait) || 0))} />
    </AuthShell>
  );
}

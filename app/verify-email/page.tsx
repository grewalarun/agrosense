import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import VerifyForm from "./verify-form";

// Reached from signup or login with ?id=<signup id>&email=…&wait=<seconds until resend>
export default async function VerifyEmailPage(props: PageProps<"/verify-email">) {
  const { id, email, wait } = await props.searchParams;
  if (typeof id !== "string" || typeof email !== "string") redirect("/signup");

  return (
    <AuthShell>
      <VerifyForm verificationId={id} email={email} initialWait={Math.min(60, Math.max(0, Number(wait) || 0))} />
    </AuthShell>
  );
}

import AuthShell from "@/components/AuthShell";
import ForgotForm from "./forgot-form";

// ?email=… prefills the box (from "Use a different email" or the login page)
export default async function ForgotPasswordPage(props: PageProps<"/forgot-password">) {
  const { email } = await props.searchParams;
  return (
    <AuthShell>
      <ForgotForm initialEmail={typeof email === "string" ? email : ""} />
    </AuthShell>
  );
}

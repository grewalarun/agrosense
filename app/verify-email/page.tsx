import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BrandMark, Wordmark } from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import VerifyForm from "./verify-form";

// Reached from signup or login with ?id=<signup id>&email=…&wait=<seconds until resend>
export default async function VerifyEmailPage(props: PageProps<"/verify-email">) {
  const { id, email, wait } = await props.searchParams;
  if (typeof id !== "string" || typeof email !== "string") redirect("/signup");
  const tc = await getTranslations("common");

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <BrandMark size={60} />
          <div>
            <Wordmark className="text-2xl leading-none" />
            <div className="text-gray-500 text-xs mt-1">{tc("tagline")}</div>
          </div>
        </div>

        <div className="mb-4"><LanguageSwitcher /></div>

        <VerifyForm verificationId={id} email={email} initialWait={Math.min(60, Math.max(0, Number(wait) || 0))} />
      </div>
    </div>
  );
}

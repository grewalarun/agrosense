"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/Spinner";
import { CODE_LENGTH, CodeInput, ResendButton, useCodeErrorText, useCountdown } from "@/components/CodeEntry";
import { type AuthResult, resendCodeAction, verifyEmailAction } from "@/lib/auth";

export default function VerifyForm({ verificationId, email, initialWait }: {
  verificationId: string; email: string; initialWait: number;
}) {
  const router = useRouter();
  const t = useTranslations("verify");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [wait, setWait] = useCountdown(initialWait);
  const codeErrorText = useCodeErrorText();

  const errorText = (result: Extract<AuthResult, { error: string }>) =>
    result.code === "SIGNUP_EXPIRED" ? t("errors.signupExpired") : codeErrorText(result);

  const verify = async (value: string) => {
    if (value.length !== CODE_LENGTH) return setError(t("errors.length"));
    setError(""); setNotice(""); setVerifying(true);
    const result = await verifyEmailAction(verificationId, value);
    if (result.error !== undefined) {
      setVerifying(false);
      setExpired(result.code === "SIGNUP_EXPIRED");
      setError(errorText(result));
      return;
    }
    // Every verified signup is a brand-new account
    router.push("/onboarding");
    router.refresh();
  };

  const onChange = (value: string) => {
    setCode(value);
    setError("");
    // Submit as soon as the last digit is typed or pasted
    if (value.length === CODE_LENGTH && code.length !== CODE_LENGTH && !verifying) verify(value);
  };

  const resend = async () => {
    setError(""); setNotice(""); setSending(true);
    const result = await resendCodeAction(verificationId);
    setSending(false);
    if (result.error !== undefined) {
      if (result.retryAfter) setWait(result.retryAfter);
      setExpired(result.code === "SIGNUP_EXPIRED");
      setError(errorText(result));
      return;
    }
    setCode("");
    setNotice(t("resent"));
    setWait(60);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); verify(code); }} className="card p-6">
      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <MailCheck size={24} className="text-primary-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">{t("title")}</h2>
      <p className="text-sm text-gray-500 mb-1">
        {t.rich("sent", { email, b: chunks => <strong className="text-gray-800 break-all">{chunks}</strong> })}
      </p>
      <p className="text-xs text-gray-400 mb-5">{t("expiry")}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
          {error}
          {expired && <> <Link href="/signup" className="font-semibold underline">{t("differentEmail")}</Link></>}
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg text-sm flex items-center gap-2" role="status">
          <CheckCircle2 size={15} className="shrink-0" /> {notice}
        </div>
      )}

      <CodeInput value={code} onChange={onChange} autoFocus describedBy="code-help" />

      <button type="submit" disabled={verifying}
        className="btn-primary w-full justify-center py-2.5 mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
        {verifying && <Spinner />}{verifying ? t("verifying") : t("submit")}
      </button>

      <div id="code-help" className="mt-4 flex flex-col items-center gap-2 text-sm">
        <ResendButton wait={wait} sending={sending} onClick={resend} />
        <Link href="/signup" className="text-gray-500 hover:underline">{t("differentEmail")}</Link>
      </div>
    </form>
  );
}

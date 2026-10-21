"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/Spinner";
import { type AuthResult, resendCodeAction, verifyEmailAction } from "@/lib/auth";

const CODE_LENGTH = 6;

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
  const [wait, setWait] = useState(initialWait);

  // Counts down to when "Send a new code" can be used again
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const errorText = (result: Extract<AuthResult, { error: string }>) => {
    switch (result.code) {
      case "WRONG_CODE": return t("errors.wrong", { left: result.attemptsLeft ?? 0 });
      case "CODE_EXPIRED": return t("errors.expired");
      case "TOO_MANY_ATTEMPTS": return t("errors.tooMany");
      case "SIGNUP_EXPIRED": return t("errors.signupExpired");
      default: return result.error;
    }
  };

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

  const onChange = (raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
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

      <label htmlFor="code" className="block text-xs font-medium text-gray-600 mb-1">{t("codeLabel")}</label>
      <input id="code" name="code" value={code} onChange={e => onChange(e.target.value)}
        inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={CODE_LENGTH} autoFocus
        className="input text-center text-2xl font-bold tracking-[0.5em] pl-[calc(0.75rem+0.5em)] py-3" placeholder="••••••" aria-describedby="code-help" />

      <button type="submit" disabled={verifying}
        className="btn-primary w-full justify-center py-2.5 mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
        {verifying && <Spinner />}{verifying ? t("verifying") : t("submit")}
      </button>

      <div id="code-help" className="mt-4 flex flex-col items-center gap-2 text-sm">
        <button type="button" onClick={resend} disabled={wait > 0 || sending}
          className="text-primary-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
          {sending ? t("sending") : wait > 0 ? t("resendIn", { seconds: wait }) : t("resend")}
        </button>
        <Link href="/signup" className="text-gray-500 hover:underline">{t("differentEmail")}</Link>
      </div>
    </form>
  );
}

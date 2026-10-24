"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/Spinner";
import PasswordInput from "@/components/PasswordInput";
import { CODE_LENGTH, CodeInput, ResendButton, useCodeErrorText, useCountdown } from "@/components/CodeEntry";
import { resendResetCodeAction, resetPasswordAction } from "@/lib/auth";

const MIN_LENGTH = 6;

export default function ResetForm({ resetId, email, initialWait }: {
  resetId: string; email: string; initialWait: number;
}) {
  const router = useRouter();
  const t = useTranslations("forgot");
  const tv = useTranslations("verify");
  const codeErrorText = useCodeErrorText();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [wait, setWait] = useCountdown(initialWait);
  const differentEmailHref = `/forgot-password?${new URLSearchParams({ email })}`;

  const showError = (result: { error: string; code?: string; attemptsLeft?: number }) => {
    setExpired(result.code === "RESET_EXPIRED");
    setError(result.code === "RESET_EXPIRED" ? t("errors.resetExpired") : codeErrorText(result));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNotice("");
    const fieldErrors: typeof errors = {};
    if (password.length < MIN_LENGTH) fieldErrors.password = t("errors.length", { min: MIN_LENGTH });
    if (confirm !== password) fieldErrors.confirm = t("errors.match");
    setErrors(fieldErrors);
    if (code.length !== CODE_LENGTH) return setError(t("errors.code"));
    if (Object.keys(fieldErrors).length) return;

    setSaving(true);
    const result = await resetPasswordAction(resetId, code, password);
    if (result.error !== undefined) {
      setSaving(false);
      return showError(result);
    }
    router.push("/dashboard");
    router.refresh();
  };

  const resend = async () => {
    setError(""); setNotice(""); setSending(true);
    const result = await resendResetCodeAction(resetId);
    setSending(false);
    if (result.error !== undefined) {
      if (result.retryAfter) setWait(result.retryAfter);
      return showError(result);
    }
    setCode("");
    setNotice(tv("resent"));
    setWait(60);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6" noValidate>
      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <KeyRound size={24} className="text-primary-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">{t("resetTitle")}</h2>
      <p className="text-sm text-gray-500 mb-1">
        {t.rich("sent", { email, b: chunks => <strong className="text-gray-800 break-all">{chunks}</strong> })}
      </p>
      <p className="text-xs text-gray-400 mb-5">{tv("expiry")}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
          {error}
          {expired && <> <Link href={differentEmailHref} className="font-semibold underline">{t("differentEmail")}</Link></>}
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg text-sm flex items-center gap-2" role="status">
          <CheckCircle2 size={15} className="shrink-0" /> {notice}
        </div>
      )}

      <div className="space-y-4">
        <div><CodeInput value={code} onChange={v => { setCode(v); setError(""); }} autoFocus describedBy="code-help" /></div>
        <PasswordInput id="new-password" label={t("newPassword")} value={password} autoComplete="new-password"
          onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }} error={errors.password} />
        <PasswordInput id="confirm-password" label={t("confirm")} value={confirm} autoComplete="new-password"
          onChange={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: undefined })); }} error={errors.confirm} />
      </div>
      <p className="text-xs text-gray-400 mt-3">{t("signOutNote")}</p>

      <button type="submit" disabled={saving}
        className="btn-primary w-full justify-center py-2.5 mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
        {saving && <Spinner />}{saving ? t("saving") : t("save")}
      </button>

      <div id="code-help" className="mt-4 flex flex-col items-center gap-2 text-sm">
        <ResendButton wait={wait} sending={sending} onClick={resend} />
        <Link href={differentEmailHref} className="text-gray-500 hover:underline">{t("differentEmail")}</Link>
      </div>
    </form>
  );
}

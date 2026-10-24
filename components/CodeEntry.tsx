"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Pieces shared by the forms that take an emailed 6-digit code (verify email, reset password)

export const CODE_LENGTH = 6;

// Seconds left until "Send a new code" can be used again
export function useCountdown(initial: number) {
  const [wait, setWait] = useState(initial);
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);
  return [wait, setWait] as const;
}

// Translated text for the backend's code errors; anything else shows the backend message
export function useCodeErrorText() {
  const t = useTranslations("verify");
  return (result: { error: string; code?: string; attemptsLeft?: number }) => {
    switch (result.code) {
      case "WRONG_CODE": return t("errors.wrong", { left: result.attemptsLeft ?? 0 });
      case "CODE_EXPIRED": return t("errors.expired");
      case "TOO_MANY_ATTEMPTS": return t("errors.tooMany");
      default: return result.error;
    }
  };
}

// One box for the whole code: digits only, phones can fill it from the email/SMS
export function CodeInput({ value, onChange, autoFocus = false, describedBy }: {
  value: string; onChange: (value: string) => void; autoFocus?: boolean; describedBy?: string;
}) {
  const t = useTranslations("verify");
  return (
    <>
      <label htmlFor="code" className="block text-xs font-medium text-gray-600 mb-1">{t("codeLabel")}</label>
      <input id="code" name="code" value={value} onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
        inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={CODE_LENGTH} autoFocus={autoFocus}
        className="input text-center text-2xl font-bold tracking-[0.5em] pl-[calc(0.75rem+0.5em)] py-3" placeholder="••••••" aria-describedby={describedBy} />
    </>
  );
}

export function ResendButton({ wait, sending, onClick }: { wait: number; sending: boolean; onClick: () => void }) {
  const t = useTranslations("verify");
  return (
    <button type="button" onClick={onClick} disabled={wait > 0 || sending}
      className="text-primary-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
      {sending ? t("sending") : wait > 0 ? t("resendIn", { seconds: wait }) : t("resend")}
    </button>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/Spinner";
import { forgotPasswordAction } from "@/lib/auth";

export default function ForgotForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const t = useTranslations("forgot");
  const ta = useTranslations("auth");
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [noAccount, setNoAccount] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNoAccount(false); setSending(true);
    const result = await forgotPasswordAction(email);
    if (result.reset) {
      const { id, email: to, wait } = result.reset;
      return router.push(`/reset-password?${new URLSearchParams({ id, email: to, wait: String(wait) })}`);
    }
    setSending(false);
    setNoAccount(result.code === "NO_ACCOUNT");
    setError(result.code === "NO_ACCOUNT" ? t("noAccount") : result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <KeyRound size={24} className="text-primary-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">{t("title")}</h2>
      <p className="text-sm text-gray-500 mb-5">{t("subtitle")}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
          {error}
          {noAccount && <> <Link href="/signup" className="font-semibold underline">{t("createAccount")}</Link></>}
        </div>
      )}

      <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">{ta("email")}</label>
      <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoFocus
        autoComplete="email" className="input" placeholder="you@example.com" />

      <button type="submit" disabled={sending}
        className="btn-primary w-full justify-center py-2.5 mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
        {sending && <Spinner />}{sending ? t("sending") : t("submit")}
      </button>

      <Link href="/login" className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 hover:underline">
        <ArrowLeft size={14} /> {t("backToLogin")}
      </Link>
    </form>
  );
}

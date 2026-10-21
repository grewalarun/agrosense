"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { BrandMark, Wordmark } from "@/components/Brand";
import { useTranslations } from "next-intl";
import { loginAction } from "@/lib/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await loginAction(email, password);
    if (result.verify) {
      // Signed up but never verified: a new code was sent
      const { id, email: to, wait } = result.verify;
      return router.push(`/verify-email?${new URLSearchParams({ id, email: to, wait: String(wait) })}`);
    }
    setLoading(false);
    if (result.error !== undefined) return setError(result.code === "GOOGLE_ACCOUNT" ? t("googleAccount") : result.error);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <BrandMark size={60} />
          <div>
            <Wordmark className="text-2xl leading-none" />
            <div className="text-gray-500 text-xs mt-1">{tc("tagline")}</div>
          </div>
        </div>

        <div className="mb-4"><LanguageSwitcher /></div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t("welcomeBack")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("signInSubtitle")}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("email")}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("password")}</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? t("hidePassword") : t("showPassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? t("signingIn") : t("signIn")}
            </button>
          </form>

          <GoogleSignInButton text="signin_with" />

          <p className="text-center text-sm text-gray-500 mt-4">
            {t("noAccount")}{" "}
            <Link href="/signup" className="text-primary-600 font-medium hover:underline">{t("createOne")}</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t("growSmarter")}
        </p>
      </div>
    </div>
  );
}

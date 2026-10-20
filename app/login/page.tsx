"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { loginAction } from "@/lib/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
    setLoading(false);
    if (result.error) return setError(result.error);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Leaf size={22} className="text-white" />
          </div>
          <div>
            <div className="text-primary-800 font-bold text-lg leading-none">{tc("appName")}</div>
            <div className="text-gray-400 text-xs">{tc("tagline")}</div>
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

"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import Spinner from "@/components/Spinner";
import { LOCALE_NAMES, locales, type Locale } from "@/i18n/config";
import { setLanguageAction } from "@/lib/actions/account";

export default function LanguagePicker() {
  const router = useRouter();
  const current = useLocale();
  const t = useTranslations("languagePage");
  const [choosing, setChoosing] = useState<Locale | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const choose = async (locale: Locale) => {
    if (locale === current || choosing) return;
    setChoosing(locale); setError("");
    const result = await setLanguageAction(locale);
    if (result.error !== undefined) { setChoosing(null); setError(result.error); return; }
    // The page re-renders in the new language; clear the spinner once it has
    startTransition(() => { router.refresh(); setChoosing(null); });
  };

  return (
    <div>
      <div role="radiogroup" aria-label={t("language")} className="card overflow-hidden">
        {locales.map((locale, i) => {
          const selected = locale === current;
          return (
            <button key={locale} type="button" role="radio" aria-checked={selected} onClick={() => choose(locale)} lang={locale}
              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-50" : ""}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{LOCALE_NAMES[locale].native}</p>
                {LOCALE_NAMES[locale].native !== LOCALE_NAMES[locale].english && (
                  <p className="text-xs text-gray-400">{LOCALE_NAMES[locale].english}</p>
                )}
              </div>
              {choosing === locale
                ? <span className="flex items-center text-xs text-gray-500"><Spinner />{t("switching")}</span>
                : selected && <span className="flex items-center gap-1 text-xs font-medium text-primary-700"><CheckCircle2 size={15} /> {t("selected")}</span>}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

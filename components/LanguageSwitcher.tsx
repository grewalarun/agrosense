"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LOCALE_NAMES, locales, type Locale } from "@/i18n/config";
import { setLanguageAction } from "@/lib/actions/account";

// Compact EN / हिं / ਪੰ switch for the login and signup screens
export default function LanguageSwitcher() {
  const router = useRouter();
  const current = useLocale();
  const t = useTranslations("language");
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState<Locale>(current);

  const choose = async (locale: Locale) => {
    if (locale === current) return;
    setChoice(locale);
    await setLanguageAction(locale);
    startTransition(() => router.refresh());
  };

  return (
    <div role="radiogroup" aria-label={t("label")} className={`flex justify-center gap-1 ${pending ? "opacity-60" : ""}`}>
      {locales.map(locale => (
        <button key={locale} type="button" role="radio" aria-checked={choice === locale} onClick={() => choose(locale)}
          title={LOCALE_NAMES[locale].native} lang={locale}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${choice === locale ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}>
          {LOCALE_NAMES[locale].short}
        </button>
      ))}
    </div>
  );
}

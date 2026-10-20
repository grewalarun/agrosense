export const locales = ["en", "hi", "pa"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
// Read by i18n/request.ts on every request; set by setLanguageAction and at login
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_NAMES: Record<Locale, { native: string; english: string; short: string }> = {
  en: { native: "English", english: "English", short: "EN" },
  hi: { native: "हिन्दी", english: "Hindi", short: "हिं" },
  pa: { native: "ਪੰਜਾਬੀ", english: "Punjabi", short: "ਪੰ" },
};

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

// Picks the first supported language from an Accept-Language header, e.g. "hi-IN,hi;q=0.9,en;q=0.8"
export function localeFromAcceptLanguage(header: string | null): Locale {
  const preferred = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return preferred.map((p) => p.lang).find(isLocale) ?? defaultLocale;
}

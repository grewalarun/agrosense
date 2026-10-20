"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { makeFormatters, type Translate } from "./format";

export function useFormatters() {
  const locale = useLocale();
  const t = useTranslations();
  return useMemo(() => makeFormatters(locale, t as unknown as Translate), [locale, t]);
}

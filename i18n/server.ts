import "server-only";
import { getLocale, getTranslations } from "next-intl/server";
import { makeFormatters, type Translate } from "./format";

export async function getFormatters() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);
  return makeFormatters(locale, t as unknown as Translate);
}

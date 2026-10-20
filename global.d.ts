import type { Locale } from "@/i18n/config";
import type messages from "./messages/en.json";

// Type-checks translation keys against the English messages
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}

import { useTranslations } from "next-intl";
import { BrandMark, Wordmark } from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Logo, language switcher and a narrow centred column for the signed-out pages
export default function AuthShell({ children }: { children: React.ReactNode }) {
  const tc = useTranslations("common");
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <BrandMark size={60} />
          <div>
            <Wordmark className="text-2xl leading-none" />
            <div className="text-gray-500 text-xs mt-1">{tc("tagline")}</div>
          </div>
        </div>

        <div className="mb-4"><LanguageSwitcher /></div>

        {children}
      </div>
    </div>
  );
}

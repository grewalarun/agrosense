import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import { User, Shield, Globe, HelpCircle, ChevronRight, Phone, Mail, Send, Bell } from "lucide-react";
import { getMe } from "@/lib/api/account";
import { getFormatters } from "@/i18n/server";
import { LOCALE_NAMES } from "@/i18n/config";

export default async function SettingsPage() {
  const [user, t, f, locale] = await Promise.all([getMe(), getTranslations("settings"), getFormatters(), getLocale()]);
  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const sections = [
    {
      title: t("account"),
      items: [
        { href: "/settings/profile", icon: User, label: t("profile"), desc: t("profileDesc"), color: "bg-primary-100 text-primary-600" },
        { href: "/settings/password", icon: Shield, label: t("password"), desc: t("passwordDesc"), color: "bg-blue-100 text-blue-600" },
      ],
    },
    {
      title: t("preferences"),
      items: [
        { href: "/settings/notifications", icon: Bell, label: t("notifications"), desc: t("notificationsDesc"), color: "bg-purple-100 text-purple-600" },
        { href: "/settings/language", icon: Globe, label: t("language"), desc: t("languageDesc", { language: LOCALE_NAMES[locale].native }), color: "bg-green-100 text-green-600" },
      ],
    },
    {
      title: t("support"),
      items: [
        { href: "/settings/help", icon: HelpCircle, label: t("help"), desc: t("helpDesc"), color: "bg-gray-100 text-gray-600" },
        { href: "/settings/email-test", icon: Send, label: t("emailTest"), desc: t("emailTestDesc"), color: "bg-amber-100 text-amber-700" },
      ],
    },
  ];

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-2xl">
        {/* Profile card */}
        <div className="card p-4 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate"><Mail size={12} /> {user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
              <Phone size={11} /> {user.phone ? `+91 ${user.phone}` : t("noPhone")} · {t("memberSince", { date: f.date(user.createdOn) })}
            </p>
          </div>
          <Link href="/settings/profile" className="btn-secondary text-xs">{t("edit")}</Link>
        </div>

        {sections.map(section => (
          <div key={section.title} className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">{section.title}</p>
            <div className="card overflow-hidden">
              {section.items.map((item, i) => (
                <Link key={item.href} href={item.href}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${i > 0 ? "border-t border-gray-50" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color} flex-shrink-0`}>
                    <item.icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-gray-400 mt-6">{t("footer")}</p>
      </main>
    </div>
  );
}

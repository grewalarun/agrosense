"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import Spinner from "@/components/Spinner";
import { setEmailOptOutAction } from "@/lib/actions/account";

export default function NotificationsForm({ optedOut: initial }: { optedOut: boolean }) {
  const t = useTranslations("notifications");
  const [optedOut, setOptedOut] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggle = async () => {
    setSaving(true); setError(null); setSaved(false);
    const result = await setEmailOptOutAction(!optedOut);
    setSaving(false);
    if (result.error !== undefined) { setError(result.error); return; }
    setOptedOut(Boolean(result.data.user.emailOptOut));
    setSaved(true);
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Bell size={18} className="text-primary-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{t("heading")}</h2>
          <p className="text-xs text-gray-500 mt-1">{t("description")}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700" role="status">{optedOut ? t("off") : t("on")}{saved && <span className="text-primary-600 font-normal"> · {t("saved")}</span>}</p>
      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3" role="alert">{error}</p>}
      <button type="button" onClick={toggle} disabled={saving} className={optedOut ? "btn-primary" : "btn-secondary"}>
        {saving && <Spinner />}{optedOut ? t("turnOn") : t("turnOff")}
      </button>
    </div>
  );
}

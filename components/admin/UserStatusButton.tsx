"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { setUserStatusAction } from "@/lib/actions/admin";

export default function UserStatusButton({ userId, name, status }: { userId: string; name: string; status: "enabled" | "disabled" }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const disabling = status === "enabled";

  const toggle = () => {
    if (disabling && !window.confirm(t("confirmDisable", { name }))) return;
    setError(null);
    startTransition(async () => {
      const result = await setUserStatusAction(userId, disabling ? "disabled" : "enabled");
      if (result.error !== undefined) setError(result.error);
    });
  };

  return (
    <div>
      <button type="button" onClick={toggle} disabled={pending}
        className={`text-xs font-medium px-2.5 py-1 rounded-lg border disabled:opacity-50 ${disabling ? "border-red-200 text-red-600 hover:bg-red-50" : "border-primary-200 text-primary-700 hover:bg-primary-50"}`}>
        {pending ? t("disabling") : disabling ? t("disable") : t("enable")}
      </button>
      {error && <p className="text-red-500 text-xs mt-1" role="alert">{error}</p>}
    </div>
  );
}

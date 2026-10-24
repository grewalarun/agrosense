"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Spinner from "@/components/Spinner";
import PasswordInput from "@/components/PasswordInput";
import { useTranslations } from "next-intl";
import { changePasswordAction } from "@/lib/actions/account";

const MIN_LENGTH = 6;

// hasPassword false: a Google-only account sets its first password (no current one)
export default function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const t = useTranslations("password");
  const router = useRouter();
  const empty = { current: "", next: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");

  const set = (k: keyof typeof empty) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; });
    setDone("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (hasPassword && !form.current) e.current = t("errors.current");
    if (form.next.length < MIN_LENGTH) e.next = t("errors.length", { min: MIN_LENGTH });
    else if (form.next === form.current) e.next = t("errors.different");
    if (form.confirm !== form.next) e.confirm = t("errors.match");
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const result = await changePasswordAction({ ...(hasPassword && { currentPassword: form.current }), newPassword: form.next });
    setSaving(false);
    if (result.error !== undefined) {
      setErrors(result.error === "Current password is incorrect" ? { current: result.error } : { form: result.error });
      return;
    }
    setForm(empty);
    setDone(hasPassword ? t("success") : t("setSuccess"));
    // Now there is a password: show the normal change-password form next time
    if (!hasPassword) router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <h2 className="font-bold text-gray-800 text-lg">{hasPassword ? t("title") : t("setTitle")}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{hasPassword ? t("subtitle") : t("setSubtitle")}</p>
      </div>
      {hasPassword && (
        <PasswordInput id="current" label={t("current")} value={form.current} onChange={set("current")} autoComplete="current-password" error={errors.current} />
      )}
      <PasswordInput id="next" label={t("new")} value={form.next} onChange={set("next")} autoComplete="new-password" error={errors.next} />
      <PasswordInput id="confirm" label={t("confirm")} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" error={errors.confirm} />

      {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}
      {done && <p className="bg-primary-50 text-primary-700 text-sm rounded-lg p-3 flex items-center gap-2" role="status"><CheckCircle2 size={15} /> {done}</p>}
      <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-2.5">
        {saving && <Spinner />}
        {hasPassword ? (saving ? t("changing") : t("submit")) : (saving ? t("setting") : t("setSubmit"))}
      </button>
    </form>
  );
}

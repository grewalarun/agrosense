"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useTranslations } from "next-intl";
import { changePasswordAction } from "@/lib/actions/account";

const MIN_LENGTH = 6;

function PasswordInput({ id, label, value, onChange, autoComplete, error }: {
  id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  const ta = useTranslations("auth");
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} className="input pr-10" value={value}
          onChange={e => onChange(e.target.value)} autoComplete={autoComplete} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? ta("hidePassword") : ta("showPassword")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

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

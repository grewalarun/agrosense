"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Mail } from "lucide-react";
import Spinner from "@/components/Spinner";
import { sendTestEmailAction } from "@/lib/actions/email";

const MAX_SUBJECT = 150;
const MAX_MESSAGE = 2000;
const EMAIL_PATTERN = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]{2,}$/;

export default function EmailTestForm({ defaultTo }: { defaultTo: string }) {
  const t = useTranslations("emailTest");
  const [form, setForm] = useState({ to: defaultTo, subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ id: string; to: string } | null>(null);

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; });
    setSent(null);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!EMAIL_PATTERN.test(form.to.trim())) e.to = t("errors.to");
    if (form.subject.length > MAX_SUBJECT) e.subject = t("errors.subject", { max: MAX_SUBJECT });
    if (form.message.length > MAX_MESSAGE) e.message = t("errors.message", { max: MAX_MESSAGE });
    if (Object.keys(e).length) { setErrors(e); return; }

    setSending(true);
    const result = await sendTestEmailAction({ to: form.to.trim(), subject: form.subject.trim(), message: form.message.trim() });
    setSending(false);
    if (result.error !== undefined) { setErrors({ form: result.error }); return; }
    setSent(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-primary-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{t("heading")}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{t("subtitle")}</p>
        </div>
      </div>

      <div>
        <label htmlFor="to" className="block text-xs font-semibold text-gray-600 mb-1.5">{t("to")} <span className="text-red-500">*</span></label>
        <input id="to" type="email" className="input" value={form.to} onChange={e => set("to", e.target.value)} autoComplete="email" />
        {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
      </div>
      <div>
        <label htmlFor="subject" className="block text-xs font-semibold text-gray-600 mb-1.5">{t("subject")}</label>
        <input id="subject" className="input" placeholder={t("subjectPlaceholder")} value={form.subject} maxLength={MAX_SUBJECT}
          onChange={e => set("subject", e.target.value)} />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
      </div>
      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-gray-600 mb-1.5">{t("message")}</label>
        <textarea id="message" rows={4} className="input resize-none" placeholder={t("messagePlaceholder")} value={form.message} maxLength={MAX_MESSAGE}
          onChange={e => set("message", e.target.value)} />
        <p className="text-xs text-gray-400 mt-1 text-right tabular-nums">{form.message.length}/{MAX_MESSAGE}</p>
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <p className="text-xs text-gray-400">{t("limitNote")}</p>
      {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3" role="alert">{errors.form}</p>}
      {sent && (
        <div className="bg-primary-50 text-primary-700 text-sm rounded-lg p-3" role="status">
          <p className="flex items-center gap-2 font-medium"><CheckCircle2 size={15} /> {t("sent", { to: sent.to })}</p>
          {sent.id && <p className="text-xs text-primary-600 mt-1 break-all">{t("sentId", { id: sent.id })}</p>}
        </div>
      )}
      <button type="submit" disabled={sending} className="btn-primary w-full justify-center py-2.5">
        {sending && <Spinner />}{sending ? t("sending") : t("send")}
      </button>
    </form>
  );
}

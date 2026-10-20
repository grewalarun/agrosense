"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import Spinner from "@/components/Spinner";
import { updateProfileAction } from "@/lib/actions/account";

export default function ProfileForm({ user }: { user: { name: string; email: string; phone: string } }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const busy = saving || refreshing;
  const changed = name.trim() !== user.name || phone.trim() !== user.phone;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    const digits = phone.replace(/[\s-]/g, "");
    if (digits && !/^(?:\+?91|0)?[6-9]\d{9}$/.test(digits)) e.phone = "Enter a valid 10-digit mobile number";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setSaved(false);
    const result = await updateProfileAction({ name: name.trim(), phone: phone.trim() });
    setSaving(false);
    if (result.error !== undefined) { setErrors({ form: result.error }); return; }
    setPhone(result.data.user.phone ?? "");
    setSaved(true);
    startRefresh(() => router.refresh());
  };

  const clear = (k: string) => { setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; }); setSaved(false); };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <h2 className="font-bold text-gray-800 text-lg">Your profile</h2>
        <p className="text-xs text-gray-400 mt-0.5">Your name appears in the sidebar and on reports.</p>
      </div>
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5">Full name <span className="text-red-500">*</span></label>
        <input id="name" className="input" value={name} onChange={e => { setName(e.target.value); clear("name"); }} autoComplete="name" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile number</label>
        <div className="flex gap-2">
          <span className="input w-16 text-center bg-gray-50 text-gray-500">+91</span>
          <input id="phone" type="tel" inputMode="numeric" className="input" placeholder="98765 43210" value={phone}
            onChange={e => { setPhone(e.target.value); clear("phone"); }} autoComplete="tel-national" />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
        <div className="relative">
          <input id="email" className="input bg-gray-50 text-gray-500 pr-9" value={user.email} readOnly aria-describedby="email-hint" />
          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <p id="email-hint" className="text-xs text-gray-400 mt-1">Used to log in, so it can&apos;t be changed here.</p>
      </div>

      {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}
      {saved && !busy && (
        <p className="bg-primary-50 text-primary-700 text-sm rounded-lg p-3 flex items-center gap-2"><CheckCircle2 size={15} /> Profile saved</p>
      )}
      <button type="submit" disabled={busy || !changed} className="btn-primary w-full justify-center py-2.5">
        {busy && <Spinner />}{busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

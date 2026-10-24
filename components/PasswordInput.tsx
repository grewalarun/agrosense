"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

// Password field with a show/hide button and an optional error under it
export default function PasswordInput({ id, label, value, onChange, autoComplete, error }: {
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

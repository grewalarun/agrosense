"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, X } from "lucide-react";
import Spinner from "@/components/Spinner";
import { LOCALE_NAMES, locales } from "@/i18n/config";
import {
  previewAudienceAction, saveMessageAction, searchUsersAction, sendTestMessageAction,
} from "@/lib/actions/admin";
import { sendUntilDone } from "@/components/admin/sendLoop";
import type { AudiencePreview, MessageAudience } from "@/lib/types";

type Picked = { id: string; name: string; email: string };
type Mode = "all" | "group" | "users";

const MAX_SUBJECT = 150;
const MAX_BODY = 5000;

export default function ComposeForm({ initialUser }: { initialUser: Picked | null }) {
  const t = useTranslations("adminMessages");
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialUser ? "users" : "all");
  const [group, setGroup] = useState({ language: "", state: "", hasActiveCycle: false, days: "" });
  const [picked, setPicked] = useState<Picked[]>(initialUser ? [initialUser] : []);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  // The audience count together with the audience it was counted for
  const [counted, setCounted] = useState<{ key: string; data: AudiencePreview | null } | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"test" | "draft" | "send" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; targeted: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // user search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Picked[] | null>(null);

  const days = group.days.trim() === "" ? undefined : Number(group.days);
  const groupAudience: MessageAudience = {
    type: "group",
    ...(group.language && { language: group.language }),
    ...(group.state.trim() && { state: group.state.trim() }),
    ...(group.hasActiveCycle && { hasActiveCycle: true }),
    ...(days !== undefined && { signedUpWithinDays: days }),
  };
  const audience: MessageAudience | null =
    mode === "all" ? { type: "all" }
      : mode === "users" ? (picked.length ? { type: "users", userIds: picked.map(u => u.id) } : null)
      : Object.keys(groupAudience).length > 1 ? groupAudience : null;
  const audienceKey = JSON.stringify(audience);

  // How many people the current choice reaches (latest answer wins)
  const latest = useRef(0);
  useEffect(() => {
    if (!audience) return;
    const mine = ++latest.current;
    const timer = setTimeout(async () => {
      const result = await previewAudienceAction(audience);
      if (mine !== latest.current) return;
      setCounted({ key: audienceKey, data: result.error === undefined ? result.data : null });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceKey]);

  // Search users to pick
  const searchSeq = useRef(0);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const mine = ++searchSeq.current;
    const timer = setTimeout(async () => {
      const result = await searchUsersAction(query.trim());
      if (mine === searchSeq.current && result.error === undefined) setResults(result.data);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // A count only applies while the audience is still the one it was counted for
  const shownPreview = audience && counted?.key === audienceKey ? counted.data : null;
  const shownResults = query.trim().length >= 2 ? results : null;
  const shownCounting = audience !== null && counted?.key !== audienceKey;

  const overLimit = shownPreview ? shownPreview.sentToday + shownPreview.count > shownPreview.dailyCap : false;
  const canSend = Boolean(audience && shownPreview && shownPreview.count > 0 && !overLimit && !shownCounting);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = t("errors.subject");
    if (!body.trim()) e.body = t("errors.body");
    if (!audience) e.audience = mode === "users" ? t("errors.users") : t("errors.group");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Saves the current text as a draft (creating it the first time)
  const saveDraft = async () => {
    const result = await saveMessageAction(draftId, { subject: subject.trim(), body: body.trim(), audience: audience! });
    if (result.error !== undefined) { setErrors({ form: result.error }); return null; }
    setDraftId(result.data.id);
    return result.data.id;
  };

  const run = async (kind: "test" | "draft" | "send", work: () => Promise<void>) => {
    setNotice(null);
    setErrors({});
    if (!validate()) return;
    setBusy(kind);
    try { await work(); } finally { setBusy(null); }
  };

  const onTest = () => run("test", async () => {
    const id = await saveDraft();
    if (!id) return;
    const result = await sendTestMessageAction(id);
    if (result.error !== undefined) { setErrors({ form: result.error }); return; }
    setNotice(t("testSent", { to: result.data.to }));
  });

  const onSaveDraft = () => run("draft", async () => {
    const id = await saveDraft();
    if (id) setNotice(t("saved"));
  });

  const onSend = () => run("send", async () => {
    const id = await saveDraft();
    if (!id) return;
    setConfirming(false);
    setProgress({ sent: 0, targeted: shownPreview?.count ?? 0 });
    const { error } = await sendUntilDone(id, { onProgress: (m) => setProgress({ sent: m.sent + m.failed, targeted: m.targeted }) });
    if (error) { setErrors({ form: error }); setProgress(null); return; }
    router.push(`/admin/messages/${id}`);
  });

  const pick = (u: Picked) => {
    setPicked(p => (p.some(x => x.id === u.id) ? p : [...p, u]));
    setQuery(""); setResults(null);
  };

  const label = "block text-xs font-semibold text-gray-600 mb-1.5";
  const modes: [Mode, string][] = [["all", t("toAll")], ["group", t("toGroup")], ["users", t("toUsers")]];

  return (
    <form onSubmit={(e) => e.preventDefault()} className="card p-6 space-y-5">
      <fieldset>
        <legend className={label}>{t("to")}</legend>
        <div className="flex flex-wrap gap-2">
          {modes.map(([value, text]) => (
            <button key={value} type="button" onClick={() => setMode(value)} aria-pressed={mode === value}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${mode === value ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {text}
            </button>
          ))}
        </div>

        {mode === "group" && (
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="g-lang" className={label}>{t("language")}</label>
              <select id="g-lang" className="input" value={group.language} onChange={e => setGroup(g => ({ ...g, language: e.target.value }))}>
                <option value="">{t("anyLanguage")}</option>
                {locales.map(l => <option key={l} value={l}>{LOCALE_NAMES[l].native}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="g-state" className={label}>{t("state")}</label>
              <input id="g-state" className="input" placeholder={t("statePlaceholder")} value={group.state} onChange={e => setGroup(g => ({ ...g, state: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="g-days" className={label}>{t("signedUpWithin")}</label>
              <input id="g-days" type="number" min={1} max={3650} className="input" placeholder={t("daysPlaceholder")} value={group.days} onChange={e => setGroup(g => ({ ...g, days: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:mt-6">
              <input type="checkbox" checked={group.hasActiveCycle} onChange={e => setGroup(g => ({ ...g, hasActiveCycle: e.target.checked }))} />
              {t("hasActiveCycle")}
            </label>
            <p className="text-xs text-gray-400 sm:col-span-2">{t("groupHint")}</p>
          </div>
        )}

        {mode === "users" && (
          <div className="mt-3 space-y-2">
            {picked.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {picked.map(u => (
                  <li key={u.id} className="flex items-center gap-1.5 text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full pl-3 pr-1.5 py-1">
                    {u.name}
                    <button type="button" aria-label={t("remove", { name: u.name })} onClick={() => setPicked(p => p.filter(x => x.id !== u.id))} className="p-0.5 rounded-full hover:bg-primary-100"><X size={12} /></button>
                  </li>
                ))}
              </ul>
            )}
            <input className="input" placeholder={t("searchUsers")} value={query} onChange={e => setQuery(e.target.value)} aria-label={t("searchUsers")} />
            {shownResults && (
              <ul className="border border-gray-100 rounded-lg divide-y divide-gray-50 max-h-56 overflow-y-auto">
                {shownResults.length === 0 && <li className="p-3 text-xs text-gray-400">{t("noResults")}</li>}
                {shownResults.map(u => (
                  <li key={u.id}><button type="button" onClick={() => pick(u)} className="w-full text-left p-3 hover:bg-gray-50">
                    <span className="text-sm text-gray-800">{u.name}</span> <span className="text-xs text-gray-400">{u.email}</span>
                  </button></li>
                ))}
              </ul>
            )}
          </div>
        )}
        {errors.audience && <p className="text-red-500 text-xs mt-1">{errors.audience}</p>}

        <p className="text-sm mt-3 min-h-5" aria-live="polite">
          {shownCounting ? <span className="text-gray-400">{t("counting")}</span>
            : shownPreview ? <span className="font-medium text-gray-700">{t("recipients", { count: shownPreview.count })}</span> : null}
        </p>
        {overLimit && shownPreview && <p className="text-amber-700 bg-amber-50 text-xs rounded-lg p-2 mt-1">{t("overLimit", { cap: shownPreview.dailyCap, used: shownPreview.sentToday })}</p>}
      </fieldset>

      <div>
        <label htmlFor="m-subject" className={label}>{t("subject")} <span className="text-red-500">*</span></label>
        <input id="m-subject" className="input" maxLength={MAX_SUBJECT} placeholder={t("subjectPlaceholder")} value={subject} onChange={e => setSubject(e.target.value)} />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
      </div>
      <div>
        <label htmlFor="m-body" className={label}>{t("body")} <span className="text-red-500">*</span></label>
        <textarea id="m-body" rows={8} className="input resize-y" maxLength={MAX_BODY} placeholder={t("bodyPlaceholder")} value={body} onChange={e => setBody(e.target.value)} />
        <div className="flex justify-between gap-3 text-xs text-gray-400 mt-1">
          <span>{t("mergeHint", { tag: "{{name}}" })}</span>
          <span className="tabular-nums whitespace-nowrap">{body.length}/{MAX_BODY}</span>
        </div>
        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
      </div>

      {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3" role="alert">{errors.form}</p>}
      {notice && <p className="bg-primary-50 text-primary-700 text-sm rounded-lg p-3 flex items-center gap-2" role="status"><CheckCircle2 size={15} />{notice}</p>}

      {progress ? (
        <div role="status" aria-live="polite" className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 flex items-center gap-2"><Spinner />{t("sending", { sent: progress.sent, total: progress.targeted })}</p>
          <div className="h-2 bg-gray-200 rounded mt-2"><div className="h-2 bg-primary-600 rounded" style={{ width: `${progress.targeted ? (progress.sent / progress.targeted) * 100 : 0}%` }} /></div>
        </div>
      ) : confirming ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-amber-900">{t("confirmSend", { count: shownPreview?.count ?? 0 })}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary" disabled={busy !== null} onClick={onSend}>{t("confirm")}</button>
            <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>{t("cancel")}</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={!canSend || busy !== null} onClick={() => validate() && setConfirming(true)}>{t("send")}</button>
          <button type="button" className="btn-secondary" disabled={busy !== null} onClick={onTest}>{busy === "test" && <Spinner />}{t("sendTest")}</button>
          <button type="button" className="btn-secondary" disabled={busy !== null} onClick={onSaveDraft}>{busy === "draft" && <Spinner />}{t("saveDraft")}</button>
        </div>
      )}
    </form>
  );
}

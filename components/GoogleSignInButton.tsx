"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Spinner from "@/components/Spinner";
import { googleSignInAction } from "@/lib/auth";

// The parts of Google Identity Services (accounts.google.com/gsi/client) used here
type GoogleId = {
  initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void; ux_mode?: "popup" }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};
declare global {
  interface Window { google?: { accounts: { id: GoogleId } } }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Google's own "Sign in with Google" button, shown under an "or" divider. Google
// checks the account and gives us an ID token, which the backend verifies.
// Renders nothing until NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.
export default function GoogleSignInButton({ text = "continue_with" }: {
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onCredential = useEffectEvent(async (credential?: string) => {
    if (!credential) return setError(t("googleFailed"));
    setError(""); setPending(true);
    const result = await googleSignInAction(credential);
    if (result.error !== undefined) {
      setPending(false);
      return setError(result.error || t("googleFailed"));
    }
    router.push(result.isNew ? "/onboarding" : "/dashboard");
    router.refresh();
  });

  useEffect(() => {
    const google = window.google;
    if (!CLIENT_ID || !loaded || !google || !buttonRef.current) return;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      ux_mode: "popup",
      callback: (response) => onCredential(response.credential),
    });
    google.accounts.id.renderButton(buttonRef.current, {
      type: "standard", theme: "outline", size: "large", shape: "pill", text,
      logo_alignment: "center", locale, width: Math.min(400, buttonRef.current.offsetWidth || 320),
    });
  }, [loaded, locale, text]);

  if (!CLIENT_ID) return null;

  return (
    <div>
      <div className="flex items-center gap-3 my-5" aria-hidden>
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">{t("or")}</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setLoaded(true)} />
      {error && <p className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">{error}</p>}
      {pending && (
        <p className="h-10 flex items-center justify-center gap-2 text-sm text-gray-500" role="status"><Spinner /> {t("googleSigningIn")}</p>
      )}
      {/* Stays mounted while signing in so Google's button survives a failed attempt */}
      <div ref={buttonRef} className={pending ? "hidden" : "flex justify-center min-h-10"} />
    </div>
  );
}

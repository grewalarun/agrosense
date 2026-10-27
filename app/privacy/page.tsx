import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandIcon, Wordmark } from "@/components/Brand";

// Static, English-only privacy policy. Keep it in step with what the app actually
// collects (see the backend's User model, clientInfo middleware and admin pages).

export const metadata: Metadata = {
  title: "Privacy Policy – FarmPaisa",
  description: "What FarmPaisa collects, why, who processes it, and the choices you have.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy – FarmPaisa", url: "/privacy", siteName: "FarmPaisa", type: "article" },
};

const LAST_UPDATED = "27 October 2026";
const CONTACT_EMAIL = "support@farmpaisa.com";

const SECTIONS = [
  { id: "collect", title: "1. What we collect" },
  { id: "use", title: "2. How we use it" },
  { id: "share", title: "3. Who processes it for us" },
  { id: "cookies", title: "4. Cookies" },
  { id: "admins", title: "5. Who at FarmPaisa can see your data" },
  { id: "security", title: "6. How we keep it safe" },
  { id: "retention", title: "7. How long we keep it" },
  { id: "choices", title: "8. Your choices and rights" },
  { id: "children", title: "9. Children" },
  { id: "changes", title: "10. Changes to this policy" },
  { id: "contact", title: "11. Contact us" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="scroll-mt-24 mt-12 text-2xl font-bold text-gray-900">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-gray-700">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="FarmPaisa home">
            <BrandIcon size={30} />
            <Wordmark className="text-lg" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-700 flex items-center gap-1">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">Legal</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 rounded-2xl bg-primary-50 ring-1 ring-primary-100 p-5 text-primary-900">
          <p className="font-semibold">The short version</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            <li>We collect your account details and the farm records you enter, so the app can work.</li>
            <li>We don&apos;t sell your data or show ads. We use Google Analytics only to understand how people use the website.</li>
            <li>Your farm records are private to your account.</li>
            <li>You can ask us to delete your account and data at any time.</li>
          </ul>
        </div>

        <nav aria-label="On this page" className="mt-8 rounded-2xl bg-white ring-1 ring-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900">On this page</p>
          <ol className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {SECTIONS.map(s => (
              <li key={s.id}><a href={`#${s.id}`} className="text-primary-700 hover:underline">{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="mt-4 space-y-4 leading-relaxed">
          <p className="mt-8">
            FarmPaisa (&quot;we&quot;, &quot;us&quot;) is an app that helps farmers record farm expenses, harvests and sales, and see
            the profit of each crop. This policy explains what personal data we handle when you use the FarmPaisa website
            and app, why, and what you can do about it. By creating an account or using FarmPaisa, you agree to this policy.
          </p>

          <H2 id="collect">1. What we collect</H2>
          <p><strong className="text-gray-900">Account details you give us:</strong> your name, email address and password. You can also add a
            mobile number and choose your language (English, Hindi or Punjabi). Your password is stored only as a secure
            one-way hash; we never see or store it in plain text.</p>
          <p><strong className="text-gray-900">If you sign in with Google:</strong> Google shares your name, email address and a Google account
            identifier with us. We don&apos;t get your Google password or access to anything else in your Google account.</p>
          <p><strong className="text-gray-900">Farm records you enter:</strong> farms (name, location such as village, district and state, and
            area), fields (area, soil type, irrigation), crops and seasons, expenses, harvests, and sales (quantities,
            prices and buyer names you type in).</p>
          <p><strong className="text-gray-900">Information created as you use FarmPaisa:</strong> when you signed up, when you were last
            active, whether you last used the website or a mobile app (and its version), your sign-in sessions, and your
            choice about announcement emails.</p>
          <p><strong className="text-gray-900">Website usage statistics:</strong> Google Analytics records how the website is used, such as
            which pages are visited, how you arrived (for example from a search), your device and browser type, and your
            approximate city or region. It doesn&apos;t receive your name, email address or farm records.</p>
          <p><strong className="text-gray-900">Verification codes:</strong> when you sign up or reset your password, we email you a 6-digit code.
            We store only a secure hash of the code, and it expires after 10 minutes.</p>
          <p>We don&apos;t collect your precise location, contacts, photos, payment details or government ID numbers.</p>

          <H2 id="use">2. How we use it</H2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To run the app: show your farms, crops, expenses, profit and reports, in the language you choose.</li>
            <li>To keep your account secure: verify your email, sign you in, reset forgotten passwords, and sign out other
              devices when you change your password.</li>
            <li>To send account emails, such as verification and password reset codes. These are always sent, because the
              app needs them.</li>
            <li>To send occasional announcement emails about FarmPaisa. You can turn these off at any time (see section 8).</li>
            <li>To understand overall use (for example, how many people signed up this month or which platform they use),
              so we can improve the app.</li>
            <li>To help you when you contact us, and to prevent misuse.</li>
          </ul>
          <p>We don&apos;t sell or rent your personal data, and we don&apos;t use it for advertising.</p>

          <H2 id="share">3. Who processes it for us</H2>
          <p>We use a few trusted service providers to run FarmPaisa. They process data only to provide their service to us:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-gray-900">MongoDB Atlas</strong>: stores the app&apos;s database.</li>
            <li><strong className="text-gray-900">Vercel</strong> and <strong className="text-gray-900">Netlify</strong>: host the FarmPaisa server and website.</li>
            <li><strong className="text-gray-900">Resend</strong>: delivers our emails, so it receives your email address and the email content.</li>
            <li><strong className="text-gray-900">Google</strong>: if you choose &quot;Sign in with Google&quot;, and for website usage
              statistics through Google Analytics and Google Tag Manager.</li>
          </ul>
          <p>These providers may store data on servers outside India. We may also share data if the law requires it, for
            example in response to a valid order from a court or government authority.</p>

          <H2 id="cookies">4. Cookies</H2>
          <p>We use only the cookies FarmPaisa needs to work:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Sign-in cookies that keep you logged in (a short-lived access token and a sign-in token that lasts up to 30 days).</li>
            <li>A cookie with your display name, so the menu can greet you.</li>
            <li>A cookie that remembers your language.</li>
            <li>Google Analytics cookies (named <code>_ga</code> and similar), which count visits and tell new visitors
              from returning ones.</li>
          </ul>
          <p>We don&apos;t use advertising cookies. Google handles analytics data under{" "}
            <a href="https://policies.google.com/privacy" className="text-primary-700 hover:underline" target="_blank" rel="noopener noreferrer">Google&apos;s privacy policy</a>.
            You can block analytics with your browser&apos;s cookie settings or the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary-700 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics opt-out add-on</a>;
            the app keeps working. When you sign in with Google, Google may also set its own cookies.</p>

          <H2 id="admins">5. Who at FarmPaisa can see your data</H2>
          <p>A small number of FarmPaisa administrators can see account details (name, email, mobile number, language,
            sign-up date, last activity, platform, sign-in method) and summary counts such as how many farms an account has.
            They use this to support users, prevent misuse and understand overall use of the app. Administrators can also
            disable an account that is being misused.</p>

          <H2 id="security">6. How we keep it safe</H2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Data travels over encrypted connections (HTTPS).</li>
            <li>Passwords and verification codes are stored only as secure hashes.</li>
            <li>New accounts must verify their email with a code, and verification and reset codes allow only a few
              attempts.</li>
            <li>Each account can only read and change its own farm records.</li>
          </ul>
          <p>No system is perfectly secure, but we work to protect your data, and we will inform affected users and the
            authorities about a data breach as the law requires.</p>

          <H2 id="retention">7. How long we keep it</H2>
          <p>We keep your account and farm records for as long as your account exists. Unfinished signups are removed
            automatically after a day, and password reset requests after an hour. When you ask us to delete your account,
            we delete your account and farm records, except where the law requires us to keep something for longer.</p>

          <H2 id="choices">8. Your choices and rights</H2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-gray-900">See and correct:</strong> you can see all your farm records in the app, and edit your name,
              mobile number and language in Settings.</li>
            <li><strong className="text-gray-900">Announcement emails:</strong> use the unsubscribe link in any announcement email, or turn them
              off in Settings.</li>
            <li><strong className="text-gray-900">Delete your account:</strong> email us from the address on your account and we will delete
              your account and farm records.</li>
            <li><strong className="text-gray-900">Questions or complaints:</strong> you can ask what data we hold about you or raise a concern
              with us (see section 11). Under India&apos;s Digital Personal Data Protection Act, 2023, you may also take a complaint
              to the Data Protection Board of India.</li>
          </ul>

          <H2 id="children">9. Children</H2>
          <p>FarmPaisa is meant for adults who manage farms. We don&apos;t knowingly create accounts for children under 18. If you
            believe a child has created an account, contact us and we will delete it.</p>

          <H2 id="changes">10. Changes to this policy</H2>
          <p>We may update this policy as FarmPaisa changes. We&apos;ll change the &quot;Last updated&quot; date at the top, and for
            important changes we&apos;ll let you know in the app or by email.</p>

          <H2 id="contact">11. Contact us</H2>
          <p>For privacy questions, data requests or complaints, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-700 font-medium hover:underline">{CONTACT_EMAIL}</a>.
            We aim to reply within 7 days.</p>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} FarmPaisa</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-primary-700">Home</Link>
            <Link href="/signup" className="hover:text-primary-700">Create account</Link>
            <Link href="/login" className="hover:text-primary-700">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

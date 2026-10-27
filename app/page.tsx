import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getImageProps } from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, CheckCircle2, ChevronDown, ClipboardList, IndianRupee, Languages, Lock,
  Pencil, Receipt, ShieldCheck, Smartphone, Sparkles, Sprout, UserPlus, MapPin, Wheat,
} from "lucide-react";
import { getUser } from "@/lib/dal";
import { BrandIcon, Wordmark } from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { CycleMock, ExpenseMock, ReportMock } from "@/components/landing/Mocks";

// Display font for the landing page only; Hindi and Punjabi fall back to system fonts
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.meta");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description"), siteName: "FarmPaisa", type: "website" },
  };
}

const FACTS = ["languages", "categories", "seasons", "price"] as const;
const SMALL = [
  { key: "edit", icon: Pencil },
  { key: "secure", icon: ShieldCheck },
  { key: "devices", icon: Smartphone },
  { key: "private", icon: Lock },
] as const;
const STEPS = [
  { key: "s1", icon: UserPlus },
  { key: "s2", icon: MapPin },
  { key: "s3", icon: Sprout },
  { key: "s4", icon: Receipt },
  { key: "s5", icon: Wheat },
] as const;
const FAQS = ["q1", "q2", "q3", "q4", "q5"] as const;

// Faint square grid used on the dark panels, faded out towards the edges
const GRID =
  "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]";

// Real dashboard screenshots of a demo farm (English). <picture> picks one by screen
// width, so a phone downloads only the phone screenshot and a computer only the desktop one.
function dashboardShot(alt: string) {
  const common = { alt, sizes: "(min-width: 768px) min(1152px, 100vw), 300px", priority: true };
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: "/landing/dashboard-desktop.png", width: 2880, height: 1800 });
  const { props: { srcSet: mobile, ...img } } = getImageProps({ ...common, src: "/landing/dashboard-mobile.png", width: 1170, height: 2532 });
  return { desktop, mobile, img };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 ring-1 ring-primary-100">
      {children}
    </span>
  );
}

// Public home page for signed-out visitors; signed-in users go to their dashboard
export default async function Home() {
  if (await getUser()) redirect("/dashboard");
  const t = await getTranslations("landing");
  const shot = dashboardShot(t("shot.alt"));

  return (
    <div className={`${display.variable} landing min-h-screen bg-bg text-gray-800`}>
      {/* Header: translucent over the dark hero */}
      <header className="sticky top-0 z-40 bg-[#052e16]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="FarmPaisa">
            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><BrandIcon size={26} /></span>
            <Wordmark onDark className="text-lg" />
          </Link>
          <nav aria-label={t("nav.label")} className="hidden md:flex items-center gap-7 ml-8 text-sm text-primary-100/80">
            <a href="#features" className="hover:text-white transition-colors">{t("nav.features")}</a>
            <a href="#how" className="hover:text-white transition-colors">{t("nav.how")}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t("nav.faq")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden lg:block"><LanguageSwitcher /></div>
            <Link href="/login" className="text-sm font-medium text-white/90 hover:text-white whitespace-nowrap">{t("nav.signIn")}</Link>
            <Link href="/signup" className="rounded-full bg-accent-400 hover:bg-accent-300 px-4 py-2 text-sm font-semibold text-primary-900 whitespace-nowrap transition-colors">
              {t("nav.start")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#052e16] text-white">
          <div aria-hidden className={`absolute inset-0 ${GRID}`} />
          <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary-500/30 blur-[120px]" />
          <div aria-hidden className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full bg-accent-400/20 blur-[120px]" />
          <div className="relative max-w-7xl mx-auto px-4 pt-14 md:pt-24 pb-48 md:pb-72 text-center">
            <div className="lg:hidden mb-8 flex justify-center"><LanguageSwitcher /></div>
            <p className="fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-primary-100 ring-1 ring-white/15 backdrop-blur">
              <Sparkles size={14} className="text-accent-300" /> {t("hero.badge")}
            </p>
            <h1 className="fade-up [animation-delay:80ms] mt-7 text-[3.4rem] leading-[1.02] sm:text-7xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">
              <span className="block md:inline">{t("hero.track")}</span>{" "}
              <span className="block md:inline bg-gradient-to-r from-accent-200 via-accent-300 to-accent-500 bg-clip-text text-transparent">{t("hero.harvest")}</span>{" "}
              <span className="block md:inline bg-gradient-to-r from-primary-300 to-emerald-400 bg-clip-text text-transparent">{t("hero.earn")}</span>
            </h1>
            <p className="fade-up [animation-delay:160ms] mt-7 text-lg sm:text-xl text-primary-100/80 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
            <div className="fade-up [animation-delay:240ms] mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent-400 hover:bg-accent-300 px-8 py-4 text-base font-semibold text-primary-900 shadow-[0_0_48px_-8px_rgba(250,204,21,0.6)] transition-colors">
                {t("hero.start")} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-semibold text-white ring-1 ring-white/20 backdrop-blur transition-colors">
                {t("hero.signIn")}
              </Link>
            </div>
            <ul className="fade-up [animation-delay:320ms] mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-primary-100/70">
              {(["free", "languages", "phone"] as const).map(k => (
                <li key={k} className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary-300" />{t(`hero.${k}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Real dashboard rising out of the hero: browser frame on computers, phone frame on phones */}
        <section className="relative -mt-36 md:-mt-56 px-4">
          <figure className="fade-up [animation-delay:400ms] relative max-w-6xl mx-auto">
            <div aria-hidden className="absolute inset-x-10 -top-6 bottom-10 rounded-[3rem] bg-gradient-to-r from-primary-400/40 via-accent-300/40 to-primary-400/40 blur-3xl" />
            <div className="relative mx-auto w-[300px] md:w-auto rounded-[2.75rem] md:rounded-2xl bg-gray-950 p-2.5 md:p-2 ring-1 ring-white/10 shadow-2xl shadow-black/30">
              <div aria-hidden className="hidden md:flex items-center gap-1.5 px-3 pb-2 pt-1">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="mx-auto h-6 w-72 rounded-md bg-white/10 text-[11px] text-white/50 flex items-center justify-center">farmpaisa.com/dashboard</span>
              </div>
              <picture>
                <source media="(min-width: 768px)" srcSet={shot.desktop} width={2880} height={1800} />
                <source srcSet={shot.mobile} width={1170} height={2532} />
                <img {...shot.img} alt={shot.img.alt} className="block w-full h-auto rounded-[2.1rem] md:rounded-lg" />
              </picture>
            </div>
            <figcaption className="mt-4 text-center text-xs text-gray-400">{t("shot.note")}</figcaption>
          </figure>
        </section>

        {/* Facts */}
        <section className="max-w-6xl mx-auto px-4 pt-14 pb-6">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-gray-200/70 ring-1 ring-gray-200/70">
            {FACTS.map(k => (
              <div key={k} className="bg-white p-6 text-center flex flex-col-reverse">
                <dt className="mt-1 text-sm text-gray-500">{t(`facts.${k}.label`)}</dt>
                <dd className="font-display text-4xl font-extrabold bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">{t(`facts.${k}.value`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features: bento grid */}
        <section id="features" className="scroll-mt-20 py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <Eyebrow>{t("nav.features")}</Eyebrow>
              <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">{t("pillars.heading")}</h2>
              <p className="mt-4 text-lg text-gray-600">{t("pillars.subtitle")}</p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-6">
              {/* Track */}
              <article className="md:col-span-3 flex flex-col rounded-3xl bg-white ring-1 ring-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-7">
                  <span className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center"><ClipboardList size={22} /></span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary-700">{t("rows.track.eyebrow")}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{t("rows.track.title")}</h3>
                  <p className="mt-2 text-gray-600">{t("rows.track.text")}</p>
                </div>
                <div className="mt-auto px-7 pb-7 pt-2 bg-gradient-to-b from-primary-50/0 to-primary-50">
                  <ExpenseMock />
                </div>
              </article>

              {/* Harvest */}
              <article className="md:col-span-3 flex flex-col rounded-3xl bg-white ring-1 ring-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-7">
                  <span className="w-11 h-11 rounded-2xl bg-accent-100 text-accent-700 flex items-center justify-center"><Wheat size={22} /></span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-accent-700">{t("rows.harvest.eyebrow")}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{t("rows.harvest.title")}</h3>
                  <p className="mt-2 text-gray-600">{t("rows.harvest.text")}</p>
                </div>
                <div className="mt-auto px-7 pb-7 pt-2 bg-gradient-to-b from-accent-50/0 to-accent-50">
                  <CycleMock />
                </div>
              </article>

              {/* Earn */}
              <article className="md:col-span-4 rounded-3xl bg-white ring-1 ring-gray-200/80 shadow-sm overflow-hidden grid sm:grid-cols-2">
                <div className="p-7">
                  <span className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center"><IndianRupee size={22} /></span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-sky-700">{t("rows.earn.eyebrow")}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{t("rows.earn.title")}</h3>
                  <p className="mt-2 text-gray-600">{t("rows.earn.text")}</p>
                </div>
                <div className="p-7 bg-gradient-to-br from-sky-50 to-primary-50 flex items-center">
                  <div className="w-full"><ReportMock /></div>
                </div>
              </article>

              {/* Languages */}
              <article className="md:col-span-2 relative rounded-3xl bg-[#052e16] text-white p-7 overflow-hidden">
                <div aria-hidden className={`absolute inset-0 ${GRID}`} />
                <div aria-hidden className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-accent-400/25 blur-3xl" />
                <div className="relative">
                  <span className="w-11 h-11 rounded-2xl bg-white/10 text-accent-300 flex items-center justify-center ring-1 ring-white/15"><Languages size={22} /></span>
                  <h3 className="mt-5 text-2xl font-bold">{t("more.language.title")}</h3>
                  <p className="mt-2 text-primary-100/80">{t("more.language.text")}</p>
                  <p aria-hidden className="mt-6 flex flex-wrap gap-2">
                    {["English", "हिंदी", "ਪੰਜਾਬੀ"].map(l => (
                      <span key={l} className="rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">{l}</span>
                    ))}
                  </p>
                  <p className="mt-4 text-xs text-accent-200">{t("more.language.tag")}</p>
                </div>
              </article>
            </div>

            {/* Smaller features */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SMALL.map(({ key, icon: Icon }) => (
                <article key={key} className="rounded-3xl bg-white ring-1 ring-gray-200/80 shadow-sm p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center"><Icon size={20} /></span>
                  <h3 className="mt-4 font-bold text-gray-900">{t(`more.${key}.title`)}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">{t(`more.${key}.text`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 py-20 lg:py-28 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <Eyebrow>{t("nav.how")}</Eyebrow>
              <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">{t("steps.heading")}</h2>
              <p className="mt-4 text-lg text-gray-600">{t("steps.subtitle")}</p>
            </div>
            <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {STEPS.map(({ key, icon: Icon }, i) => (
                <li key={key} className="relative rounded-3xl bg-bg ring-1 ring-gray-200/80 p-6">
                  <span aria-hidden className="font-display absolute top-4 right-5 text-5xl font-extrabold text-primary-100">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/25">
                    <Icon size={20} />
                  </span>
                  <h3 className="relative mt-5 font-bold text-gray-900"><span className="sr-only">{i + 1}. </span>{t(`steps.${key}.title`)}</h3>
                  <p className="relative mt-1.5 text-sm text-gray-600">{t(`steps.${key}.text`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-4 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <Eyebrow>{t("nav.faq")}</Eyebrow>
              <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">{t("faq.heading")}</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map(q => (
                <details key={q} className="group rounded-2xl bg-white ring-1 ring-gray-200/80 px-6 py-5 open:shadow-md open:ring-primary-200 transition">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                    {t(`faq.${q}.q`)}
                    <span className="w-8 h-8 rounded-full bg-gray-100 group-open:bg-primary-100 flex items-center justify-center shrink-0 transition-colors">
                      <ChevronDown size={16} className="text-gray-500 group-open:text-primary-700 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600">{t(`faq.${q}.a`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 pb-20 lg:pb-28">
          <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] bg-[#052e16] px-6 py-16 sm:px-12 sm:py-20 text-center">
            <div aria-hidden className={`absolute inset-0 ${GRID}`} />
            <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary-500/30 blur-[100px]" />
            <div aria-hidden className="absolute -bottom-32 -right-20 w-[400px] h-[400px] rounded-full bg-accent-400/20 blur-[100px]" />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">{t("cta.title")}</h2>
              <p className="mt-4 text-lg text-primary-100/80">{t("cta.text")}</p>
              <Link href="/signup" className="group mt-10 inline-flex items-center gap-2 rounded-full bg-accent-400 hover:bg-accent-300 px-8 py-4 text-base font-semibold text-primary-900 shadow-[0_0_48px_-8px_rgba(250,204,21,0.6)] transition-colors">
                {t("cta.button")} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <BrandIcon size={28} />
              <Wordmark className="text-lg" />
            </div>
            <p className="mt-3 text-sm text-gray-500">{t("footer.tagline")}</p>
            <p className="mt-1 text-sm text-gray-500">{t("footer.madeFor")}</p>
          </div>
          <nav aria-label={t("footer.links")} className="sm:justify-self-end">
            <ul className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm">
              <li><a href="#features" className="text-gray-600 hover:text-primary-700">{t("footer.features")}</a></li>
              <li><Link href="/login" className="text-gray-600 hover:text-primary-700">{t("footer.signIn")}</Link></li>
              <li><a href="#faq" className="text-gray-600 hover:text-primary-700">{t("footer.faq")}</a></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-primary-700">{t("footer.signUp")}</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary-700">{t("footer.privacy")}</Link></li>
            </ul>
          </nav>
        </div>
        <p className="border-t border-gray-100 py-5 text-center text-xs text-gray-400">{t("footer.rights", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}

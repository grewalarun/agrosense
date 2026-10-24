import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, BarChart3, CheckCircle2, ChevronDown, ClipboardList, Languages, Lock,
  Pencil, Receipt, ShieldCheck, ShoppingCart, Smartphone, Sprout, UserPlus, MapPin, Wheat,
} from "lucide-react";
import { getUser } from "@/lib/dal";
import { BrandIcon, Wordmark } from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { CycleMock, ExpenseMock, PhoneMock, ReportMock } from "@/components/landing/Mocks";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.meta");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description"), siteName: "FarmPaisa", type: "website" },
  };
}

const PILLARS = [
  { key: "plan", icon: ClipboardList, tone: "bg-primary-100 text-primary-700" },
  { key: "grow", icon: Sprout, tone: "bg-accent-100 text-accent-700" },
  { key: "analyze", icon: BarChart3, tone: "bg-sky-100 text-sky-700" },
] as const;

const MORE = [
  { key: "sales", icon: ShoppingCart },
  { key: "edit", icon: Pencil },
  { key: "language", icon: Languages },
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

// Public home page for signed-out visitors; signed-in users go to their dashboard
export default async function Home() {
  if (await getUser()) redirect("/dashboard");
  const t = await getTranslations("landing");

  const rows = [
    { key: "plan", mock: <CycleMock /> },
    { key: "grow", mock: <ExpenseMock /> },
    { key: "analyze", mock: <ReportMock /> },
  ] as const;

  return (
    <div className="min-h-screen bg-bg text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="FarmPaisa">
            <BrandIcon size={32} />
            <Wordmark className="text-lg" />
          </Link>
          <nav aria-label={t("nav.label")} className="hidden md:flex items-center gap-6 ml-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-primary-700">{t("nav.features")}</a>
            <a href="#how" className="hover:text-primary-700">{t("nav.how")}</a>
            <a href="#faq" className="hover:text-primary-700">{t("nav.faq")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden lg:block"><LanguageSwitcher /></div>
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary-700 whitespace-nowrap">{t("nav.signIn")}</Link>
            <Link href="/signup" className="btn-primary whitespace-nowrap">{t("nav.start")}</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,#dcfce7_0%,transparent_70%),radial-gradient(40%_40%_at_10%_90%,#fef9c3_0%,transparent_70%)]" />
          <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <div className="lg:hidden mb-6 flex justify-start"><LanguageSwitcher /></div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                <span className="block text-primary-700">{t("hero.plan")}</span>
                <span className="block text-accent-600">{t("hero.grow")}</span>
                <span className="block text-gray-900">{t("hero.analyze")}</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-xl">{t("hero.subtitle")}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/signup" className="btn-primary justify-center !text-base !px-6 !py-3 gap-2">
                  {t("hero.start")} <ArrowRight size={18} />
                </Link>
                <Link href="/login" className="btn-secondary justify-center !text-base !px-6 !py-3 bg-white">{t("hero.signIn")}</Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                {(["free", "languages", "phone"] as const).map(k => (
                  <li key={k} className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary-600" />{t(`hero.${k}`)}</li>
                ))}
              </ul>
            </div>
            <figure>
              <PhoneMock />
              <figcaption className="sr-only">{t("hero.mockLabel")}</figcaption>
            </figure>
          </div>
        </section>

        {/* Plan · Grow · Analyze */}
        <section id="features" className="scroll-mt-20 py-16 lg:py-24 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("pillars.heading")}</h2>
              <p className="mt-3 text-gray-600 text-lg">{t("pillars.subtitle")}</p>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {PILLARS.map(({ key, icon: Icon, tone }) => (
                <div key={key} className="rounded-2xl border border-gray-100 bg-bg p-6">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}><Icon size={22} /></span>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{t(`pillars.${key}.title`)}</h3>
                  <p className="mt-1 text-gray-600">{t(`pillars.${key}.text`)}</p>
                  <ul className="mt-4 space-y-2">
                    {(["p1", "p2", "p3"] as const).map(p => (
                      <li key={p} className="flex gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-primary-600 shrink-0 mt-0.5" />{t(`pillars.${key}.${p}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* One row per pillar, text and screen alternating */}
        <section className="py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 space-y-20 lg:space-y-28">
            {rows.map(({ key, mock }, i) => (
              <div key={key} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <p className="text-sm font-bold uppercase tracking-wider text-accent-700">{t(`rows.${key}.eyebrow`)}</p>
                  <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{t(`rows.${key}.title`)}</h3>
                  <p className="mt-3 text-gray-600 text-lg">{t(`rows.${key}.text`)}</p>
                  <ul className="mt-5 space-y-2.5">
                    {(["p1", "p2", "p3"] as const).map(p => (
                      <li key={p} className="flex gap-2 text-gray-700">
                        <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />{t(`rows.${key}.${p}`)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative ${i % 2 ? "lg:order-1" : ""}`}>
                  <div aria-hidden className="absolute -inset-4 sm:-inset-6 rounded-3xl bg-gradient-to-br from-primary-100/70 to-accent-100/60" />
                  <div className="relative max-w-md mx-auto">{mock}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* More features */}
        <section className="py-16 lg:py-20 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900">{t("more.heading")}</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MORE.map(({ key, icon: Icon }) => (
                <div key={key} className="flex gap-4 rounded-2xl border border-gray-100 p-5">
                  <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0"><Icon size={20} /></span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t(`more.${key}.title`)}</h3>
                    <p className="mt-1 text-sm text-gray-600">{t(`more.${key}.text`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("steps.heading")}</h2>
              <p className="mt-3 text-gray-600 text-lg">{t("steps.subtitle")}</p>
            </div>
            <ol className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-4">
              {STEPS.map(({ key, icon: Icon }, i) => (
                <li key={key} className="relative flex lg:flex-col gap-4 lg:gap-3">
                  {/* Connector: down the side on phones, across the top on desktop */}
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="absolute bg-primary-200 left-6 top-12 bottom-[-1.5rem] w-0.5 lg:left-12 lg:right-[-1rem] lg:top-6 lg:bottom-auto lg:h-0.5 lg:w-auto" />
                  )}
                  <span className="relative z-10 w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-600/30">
                    <Icon size={22} />
                  </span>
                  <div className="pt-1 lg:pt-0">
                    <p className="text-xs font-bold text-primary-700">{i + 1}</p>
                    <h3 className="font-semibold text-gray-900">{t(`steps.${key}.title`)}</h3>
                    <p className="mt-1 text-sm text-gray-600">{t(`steps.${key}.text`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-16 lg:py-20 bg-white border-y border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900">{t("faq.heading")}</h2>
            <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {FAQS.map(q => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                    {t(`faq.${q}.q`)}
                    <ChevronDown size={18} className="text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-gray-600">{t(`faq.${q}.a`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-3xl bg-primary-800 px-6 py-12 sm:px-12 text-center relative overflow-hidden">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgba(250,204,21,0.25)_0%,transparent_70%)]" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white">{t("cta.title")}</h2>
                <p className="mt-3 text-primary-100 text-lg">{t("cta.text")}</p>
                <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent-300 hover:bg-accent-200 px-6 py-3 font-semibold text-primary-900 transition-colors">
                  {t("cta.button")} <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <BrandIcon size={28} />
              <Wordmark className="text-lg" />
            </div>
            <p className="mt-2 text-sm text-gray-500">{t("footer.tagline")}</p>
            <p className="mt-1 text-sm text-gray-500">{t("footer.madeFor")}</p>
          </div>
          <nav aria-label={t("footer.links")} className="sm:justify-self-end">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              <li><a href="#features" className="text-gray-600 hover:text-primary-700">{t("footer.features")}</a></li>
              <li><Link href="/login" className="text-gray-600 hover:text-primary-700">{t("footer.signIn")}</Link></li>
              <li><a href="#faq" className="text-gray-600 hover:text-primary-700">{t("footer.faq")}</a></li>
              <li><Link href="/signup" className="text-gray-600 hover:text-primary-700">{t("footer.signUp")}</Link></li>
            </ul>
          </nav>
        </div>
        <p className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">{t("footer.rights", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}

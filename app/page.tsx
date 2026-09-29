import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { isFlagged } from "@/lib/flags";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";
import { APP_TAGLINE } from "@/lib/constants";

export const metadata = {
  title: "CampusHub — your campus, connected",
  description:
    "One verified space for your campus: deals from around campus, fest events, shared notes, a student marketplace, and the study group you were looking for.",
};

export default async function LandingPage() {
  // Admins can take the landing page down entirely (feature flag).
  if (!(await isFlagged("public_landing"))) redirect("/login");

  const session = await readSession();
  const cta = session ? { href: "/feed", label: "Open CampusHub" } : { href: "/login", label: "Enter CampusHub" };

  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href={cta.href} className="btn-outline h-9 px-3.5 text-[13.5px]">
            {session ? "Open app" : "Sign in"}
          </Link>
          <Link href={cta.href} className="btn-solid h-9 px-3.5 text-[13.5px]">
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero — deliberately off-grid: text left-heavy, list offset right */}
      <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 pt-10 lg:grid-cols-[7fr_5fr] lg:gap-6 lg:pt-16">
        <div>
          <p className="chip bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]">
            <span className="size-1.5 rounded-[2px] bg-[color:var(--color-pine)]" aria-hidden />
            {APP_TAGLINE}
          </p>
          <h1 className="font-display mt-5 text-[40px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
            The internet your campus actually needs.
          </h1>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
            Every college runs on WhatsApp groups, torn noticeboards and screenshots of screenshots.
            CampusHub puts the whole thing in one verified place — no randoms, no spam, no &ldquo;which group is this?&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={cta.href} className="btn-solid h-11 px-5 text-[15px]">
              {cta.label} <Icon.arrowRight size={16} />
            </Link>
            <span className="text-[13px] text-[color:var(--color-ink-faint)]">
              Verified students only — it takes a minute.
            </span>
          </div>
        </div>

        {/* What lives here — a plain list, not a card grid */}
        <ul className="divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)] lg:mt-14">
          {[
            ["Deals worth queueing for", "Students share real offers from cafés, salons and shops near campus."],
            ["Everything happening, dated", "Fests, workshops, tryouts — posted by the people running them."],
            ["Notes that actually help", "Resources by subject and semester, from people who survived them."],
            ["Buy, sell, borrow", "A marketplace for the stuff you only need for four years."],
            ["Lost & found that works", "Post it where the whole campus looks, not one group chat."],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4 py-4">
              <span className="mt-0.5 font-display text-[13px] font-bold text-[color:var(--color-ink-faint)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[14.5px] font-semibold">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Verification strip */}
      <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <h2 className="font-display text-[19px] font-bold tracking-tight">Verified, not open</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-ink-soft)]">
              You sign in with Google or your phone — then a short form ties you to your campus. The admin
              reviews every request, so what gets posted stays relevant and accountability is real.
            </p>
          </div>
          <ol className="flex flex-col gap-2 text-[13.5px] font-medium md:items-end">
            {["Sign in", "Verify your campus", "Get approved", "Join in"].map((step, i) => (
              <li key={step} className="flex items-center gap-2.5">
                <span className="inline-flex size-5 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] text-[11px] font-bold text-[color:var(--color-ink-soft)]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-[12.5px] text-[color:var(--color-ink-faint)]">
        <Logo size="sm" />
        <p>Built for students, moderated by your campus.</p>
      </footer>
    </main>
  );
}

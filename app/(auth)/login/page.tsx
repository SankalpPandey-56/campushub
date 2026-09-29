import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect("/feed");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Brand side — desktop only, asymmetric composition */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[color:var(--color-pine-deep)] p-10 text-white lg:flex">
        <Logo variant="light" size="lg" />
        <div className="max-w-md">
          <h1 className="font-display text-[34px] font-bold leading-[1.12] tracking-tight">
            One campus.
            <br />
            Every conversation.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            Deals from the market gate, lost earphones, fest tickets, second-hand calculators and the
            group that finally gets you through DSA. Only for students of your campus — verified, not vibe-checked.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[13px] text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-[2px] bg-[color:var(--color-marigold)]" />
              Verified students only
            </span>
            <span aria-hidden>·</span>
            <span>No algorithms, just your campus</span>
          </div>
        </div>
        <p className="text-[12px] text-white/40">CampusHub — your campus, connected.</p>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size="lg" />
          </div>
          <h2 className="font-display mt-8 text-2xl font-bold tracking-tight lg:mt-0">Sign in</h2>
          <p className="mt-1.5 text-[13.5px] text-[color:var(--color-ink-soft)]">
            Use your Google account or your phone number.
          </p>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

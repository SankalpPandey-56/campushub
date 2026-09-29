"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sendOtpAction, verifyOtpAction, type LoginState } from "@/app/(auth)/actions";
import { Icon } from "@/components/icons";
import { FormBanner, FieldError, Spinner } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const initial: LoginState = { step: "phone" };

export function LoginForm() {
  const [state, setState] = useState<LoginState>(initial);
  const [pending, startTransition] = useTransition();
  const params = useSearchParams();
  const oauthError = params.get("error");
  const formError =
    oauthError === "google_unconfigured"
      ? "Google sign-in isn't configured yet — use phone login or contact the admin."
      : oauthError === "oauth_state" || oauthError === "oauth_failed"
        ? "Google sign-in failed. Please try again."
        : null;

  function submit(kind: "send" | "verify") {
    const formData = new FormData(document.getElementById("login-form") as HTMLFormElement);
    startTransition(async () => {
      const next = kind === "send" ? await sendOtpAction(state, formData) : await verifyOtpAction(state, formData);
      if (next) setState(next);
    });
  }

  return (
    <div className="mt-7 space-y-4">
      {formError ? <FormBanner kind="error">{formError}</FormBanner> : null}

      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] px-4 py-2.5 text-[14px] font-semibold text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-paper-deep)]"
      >
        <GoogleMark />
        Continue with Google
      </a>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
        <span className="text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--color-ink-faint)]">or phone</span>
        <span className="h-px flex-1 bg-[color:var(--color-line)]" />
      </div>

      <form id="login-form" onSubmit={(e) => { e.preventDefault(); submit(state.step === "phone" ? "send" : "verify"); }}>
        <AnimatePresence mode="wait" initial={false}>
          {state.step === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">Mobile number</span>
                <span className="flex items-stretch gap-2">
                  <span className="inline-flex items-center rounded-lg border border-[color:var(--color-line-strong)] bg-[color:var(--color-paper-deep)] px-3 text-[14px] font-medium text-[color:var(--color-ink-soft)]">
                    +91
                  </span>
                  <input
                    name="phone"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98XXXXXXXX"
                    maxLength={13}
                    className={cn("input-base", "tracking-wide")}
                    required
                  />
                </span>
              </label>
              <FieldError>{state.error}</FieldError>
              <button type="submit" disabled={pending} className="btn-solid w-full">
                {pending ? <Spinner /> : null}
                {pending ? "Sending…" : "Send OTP"}
              </button>
              {state.notice ? <p className="pt-1 text-[12.5px] text-[color:var(--color-ink-soft)]">{state.notice}</p> : null}
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <p className="text-[13px] text-[color:var(--color-ink-soft)]">
                Code sent to <span className="font-semibold text-[color:var(--color-ink)]">+91 {state.phone?.replace(/\D/g, "").slice(-10)}</span>{" "}
                <button type="button" className="link-underline font-medium text-[color:var(--color-pine)]" onClick={() => setState({ step: "phone" })}>
                  change
                </button>
              </p>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">6-digit code</span>
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  maxLength={6}
                  className="input-base text-center text-[18px] font-semibold tracking-[0.5em]"
                  required
                />
                <input type="hidden" name="phone" value={state.phone ?? ""} />
              </label>
              <FieldError>{state.error}</FieldError>
              <button type="submit" disabled={pending} className="btn-solid w-full">
                {pending ? <Spinner /> : null}
                {pending ? "Verifying…" : "Verify & continue"}
              </button>
              {state.notice ? <p className="pt-1 text-[12.5px] text-[color:var(--color-ink-soft)]">{state.notice}</p> : null}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="pt-2 text-center text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
        CampusHub is only for verified students. After signing in you&apos;ll answer a short
        verification form — the admin approves new members manually.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

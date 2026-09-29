"use client";

import { useActionState } from "react";
import { submitVerificationAction, type VerifyState } from "@/app/(auth)/verify/actions";
import { FieldError, FormBanner, SubmitButton } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";

type Campus = { id: string; name: string; city: string | null };

export function VerificationForm({
  campuses,
  defaultName,
  defaultEmail,
  lockedEmail,
}: {
  campuses: Campus[];
  defaultName: string;
  defaultEmail: string | null;
  lockedEmail: boolean;
}) {
  const [state, action, pending] = useActionState(submitVerificationAction, {});

  if (state.ok) {
    return (
      <div className="py-4 text-center">
        <span className="mx-auto mb-4 inline-flex size-11 items-center justify-center rounded-full bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]">
          <Icon.check size={20} />
        </span>
        <h2 className="font-display text-[16px] font-bold">Request submitted</h2>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
          The admin has been notified. You&apos;ll be able to browse CampusHub as soon as your request is
          approved — usually within a day.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Full name</span>
          <input name="fullName" defaultValue={defaultName} required className="input-base" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={defaultEmail ?? ""}
            readOnly={lockedEmail}
            className="input-base read-only:opacity-70"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Course</span>
          <input name="course" required placeholder="B.Tech CSE" className="input-base" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Year</span>
          <select name="year" required defaultValue="" className="input-base">
            <option value="" disabled>
              Select year
            </option>
            <option value="1">First year</option>
            <option value="2">Second year</option>
            <option value="3">Third year</option>
            <option value="4">Fourth year</option>
            <option value="5">Fifth year</option>
            <option value="PG">Postgraduate</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Campus</span>
        <select name="campusId" required defaultValue="" className="input-base">
          <option value="" disabled>
            Select your campus
          </option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.city ? ` — ${c.city}` : ""}
            </option>
          ))}
        </select>
      </label>

      <div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            College email <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="collegeEmail" type="email" placeholder="e.g. roll@university.ac.in" className="input-base" />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Anything that helps us verify you <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <textarea
            name="extraInfo"
            rows={3}
            placeholder="Hostel, roll number format, club memberships — no sensitive documents please."
            className="input-base resize-y"
          />
        </label>
      </div>

      <FieldError>{state.error}</FieldError>
      <SubmitButton pending={pending} pendingLabel="Submitting…">
        Submit for review
      </SubmitButton>
    </form>
  );
}

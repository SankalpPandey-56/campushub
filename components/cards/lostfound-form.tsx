"use client";

import { useActionState } from "react";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { createLostFoundAction, type LostFoundFormState } from "@/components/cards/lostfound-form-actions";

export function LostFoundForm() {
  const [state, action, pending] = useActionState(createLostFoundAction, {});

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-semibold">What happened?</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[color:var(--color-line-strong)] px-3 py-2.5 text-[14px] font-semibold has-checked:border-[color:var(--color-danger)] has-checked:bg-[#faeeea] has-checked:text-[color:var(--color-danger)]">
            <input type="radio" name="type" value="LOST" defaultChecked className="sr-only" />
            I lost something
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[color:var(--color-line-strong)] px-3 py-2.5 text-[14px] font-semibold has-checked:border-[color:var(--color-pine)] has-checked:bg-[color:var(--color-pine-soft)] has-checked:text-[color:var(--color-pine-deep)]">
            <input type="radio" name="type" value="FOUND" className="sr-only" />
            I found something
          </label>
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Item</span>
        <input name="title" required maxLength={100} className="input-base" placeholder="e.g. Black JBL earbuds case" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Description</span>
        <textarea name="description" required rows={3} maxLength={1200} className="input-base resize-y" placeholder="Identifying details help — stickers, scratches, contents. Don&apos;t share anything you wouldn&apos;t want public." />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Where <span className="font-normal text-[color:var(--color-ink-faint)]">(approx. is fine)</span>
          </span>
          <input name="location" maxLength={120} className="input-base" placeholder="Library, 2nd floor" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            When <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="lastSeenAt" type="date" className="input-base" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Photo URL <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
        </span>
        <input name="imageUrl" type="url" className="input-base" placeholder="https://…" />
      </label>

      <p className="text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
        People contact you through CampusHub messages — keep valuables&apos; proof-of-ownership questions
        to that chat, and hand things over in a public spot.
      </p>

      <FieldError>{state.error}</FieldError>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Posting…">Post it</SubmitButton>
      </div>
    </form>
  );
}

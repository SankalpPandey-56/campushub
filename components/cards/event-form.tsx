"use client";

import { useActionState } from "react";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { createEventAction, type EventFormState } from "@/components/cards/event-form-actions";

export function EventForm() {
  const [state, action, pending] = useActionState(createEventAction, {});

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Event title</span>
        <input name="title" required maxLength={120} className="input-base" placeholder="e.g. HackNight 3.0" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Description</span>
        <textarea name="description" required rows={3} maxLength={2000} className="input-base resize-y" placeholder="What's happening, who's it for, what to bring…" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Date & time</span>
          <input name="startsAt" type="datetime-local" required className="input-base" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Location</span>
          <input name="location" required maxLength={120} className="input-base" placeholder="Auditorium, Block C" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Category</span>
          <select name="category" defaultValue="TECH" className="input-base">
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Registration link <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="regLink" type="url" className="input-base" placeholder="https://…" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Poster image URL <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
        </span>
        <input name="imageUrl" type="url" className="input-base" placeholder="https://…" />
      </label>

      <FieldError>{state.error}</FieldError>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Posting…">Post event</SubmitButton>
      </div>
    </form>
  );
}

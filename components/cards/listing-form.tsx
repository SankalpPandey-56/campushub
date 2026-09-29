"use client";

import { useActionState } from "react";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { LISTING_CATEGORIES, LISTING_CONDITIONS } from "@/lib/constants";
import { createListingAction, type ListingFormState } from "@/components/cards/listing-form-actions";

export function ListingForm() {
  const [state, action, pending] = useActionState(createListingAction, {});

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Item name</span>
        <input name="title" required maxLength={100} className="input-base" placeholder="e.g. Casio FX-991EX" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Price ₹</span>
          <input name="price" type="number" min="1" max="1000000" required className="input-base" placeholder="1200" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Condition</span>
          <select name="condition" defaultValue="GOOD" className="input-base">
            {LISTING_CONDITIONS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Category</span>
          <select name="category" defaultValue="BOOKS" className="input-base">
            {LISTING_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Pickup location <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="location" maxLength={120} className="input-base" placeholder="Hostel B, or Library steps" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Description</span>
        <textarea name="description" required rows={3} maxLength={1500} className="input-base resize-y" placeholder="How old, any scratches, what's included…" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Photo URL <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
        </span>
        <input name="imageUrl" type="url" className="input-base" placeholder="https://…" />
      </label>

      <p className="text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
        Buyers contact you through CampusHub messages — your number stays private. Meet in a public
        campus spot; no payments happen inside CampusHub.
      </p>

      <FieldError>{state.error}</FieldError>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Listing…">List item</SubmitButton>
      </div>
    </form>
  );
}

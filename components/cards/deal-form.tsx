"use client";

import { useActionState } from "react";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { DEAL_CATEGORIES } from "@/lib/constants";
import { saveDealAction, type DealFormState } from "@/components/cards/deal-form-actions";

type DealFormProps =
  | { mode: "create" }
  | { mode: "edit"; deal: { id: string; title: string; description: string; business: string; location: string | null; originalPrice: number | null; discountedPrice: number | null; category: string; expiresAt: string | null; imageUrl: string | null } };

export function DealForm(props: DealFormProps) {
  const actionFn =
    props.mode === "edit"
      ? (s: DealFormState, fd: FormData) => saveDealAction(s, fd, props.deal.id)
      : (s: DealFormState, fd: FormData) => saveDealAction(s, fd);
  const [state, action, pending] = useActionState(actionFn, {});
  const d = props.mode === "edit" ? props.deal : undefined;

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Offer title</span>
        <input name="title" required maxLength={120} defaultValue={d?.title} className="input-base" placeholder="e.g. 20% off at Brew & Co" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Business / store</span>
          <input name="business" required maxLength={80} defaultValue={d?.business} className="input-base" placeholder="Brew & Co" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Location <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="location" maxLength={120} defaultValue={d?.location ?? ""} className="input-base" placeholder="Market gate, 800m" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Details</span>
        <textarea name="description" required rows={3} maxLength={1500} defaultValue={d?.description} className="input-base resize-y" placeholder="What's the offer? Any conditions?" />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Was ₹ <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="originalPrice" type="number" min="0" max="1000000" defaultValue={d?.originalPrice ?? ""} className="input-base" placeholder="250" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Now ₹ <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="discountedPrice" type="number" min="0" max="1000000" defaultValue={d?.discountedPrice ?? ""} className="input-base" placeholder="200" />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-1.5 block text-[13px] font-semibold">Category</span>
          <select name="category" defaultValue={d?.category ?? "FOOD"} className="input-base">
            {DEAL_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Valid until <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="expiresAt" type="date" defaultValue={d?.expiresAt?.slice(0, 10) ?? ""} className="input-base" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Image URL <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="imageUrl" type="url" defaultValue={d?.imageUrl ?? ""} className="input-base" placeholder="https://…" />
        </label>
      </div>

      <FieldError>{state.error}</FieldError>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel={props.mode === "edit" ? "Saving…" : "Sharing…"}>
          {props.mode === "edit" ? "Save changes" : "Share deal"}
        </SubmitButton>
      </div>
    </form>
  );
}

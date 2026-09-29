"use client";

import { useActionState } from "react";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { createGroupAction, type GroupFormState } from "@/components/cards/group-form-actions";

const SUGGESTIONS = ["DSA Grind", "Placement Prep", "Machine Learning", "Web Dev Beginners", "CAT Prep", "GATE Squad", "Design Circle"];

export function GroupForm() {
  const [state, action, pending] = useActionState(createGroupAction, {});

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Group name</span>
        <input name="name" required maxLength={80} className="input-base" placeholder="e.g. DSA Grind" />
      </label>
      <p className="-mt-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              const input = (e.currentTarget.closest("form") as HTMLFormElement).elements.namedItem("name") as HTMLInputElement;
              input.value = s;
            }}
            className="chip border border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)]"
          >
            {s}
          </button>
        ))}
      </p>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Subject / focus <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
        </span>
        <input name="subject" maxLength={60} className="input-base" placeholder="Algorithms" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Description</span>
        <textarea name="description" required rows={3} maxLength={800} className="input-base resize-y" placeholder="What's the plan — weekly meets, problem sets, mock interviews?" />
      </label>

      <FieldError>{state.error}</FieldError>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Creating…">Create group</SubmitButton>
      </div>
    </form>
  );
}

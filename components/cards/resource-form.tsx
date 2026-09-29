"use client";

import { useActionState } from "react";
import { FieldError, SubmitButton } from "@/components/ui/primitives";
import { createResourceAction, type ResourceFormState } from "@/components/cards/resource-form-actions";

export function ResourceForm() {
  const [state, action, pending] = useActionState(createResourceAction, {});

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Title</span>
        <input name="title" required maxLength={120} className="input-base" placeholder="e.g. DSA — Graphs master sheet" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Description</span>
        <textarea name="description" required rows={3} maxLength={1500} className="input-base resize-y" placeholder="What does it cover? Who is it useful for?" />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Subject</span>
          <input name="subject" required maxLength={60} className="input-base" placeholder="Data Structures" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Course <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="course" maxLength={60} className="input-base" placeholder="B.Tech CSE" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Semester <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="semester" maxLength={20} className="input-base" placeholder="3" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Link to notes / drive / docs <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
        </span>
        <input name="link" type="url" className="input-base" placeholder="https://…" />
      </label>

      <FieldError>{state.error}</FieldError>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Sharing…">Share resource</SubmitButton>
      </div>
    </form>
  );
}

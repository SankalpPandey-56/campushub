"use client";

import { useActionState } from "react";
import { createPostAction, updatePostAction, type ActionResult } from "@/components/feed/actions";
import { POST_CATEGORIES } from "@/lib/constants";
import { FieldError, FormBanner, SubmitButton } from "@/components/ui/primitives";

type ComposerProps =
  | { mode: "create"; post?: never }
  | {
      mode: "edit";
      post: { id: string; title: string | null; content: string; category: string; imageUrl: string | null; location: string | null };
    };

export function Composer(props: ComposerProps) {
  const actionFn =
    props.mode === "edit"
      ? (_prev: State, fd: FormData) => updatePostAction(props.post.id, fd)
      : createAction;

  const [state, action, pending] = useActionState(actionFn, {} as State);
  const p = props.mode === "edit" ? props.post : undefined;

  return (
    <form action={action} className="card-surface space-y-4 p-5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Category</span>
        <select name="category" defaultValue={p?.category ?? "CAMPUS"} className="input-base">
          {POST_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label} — {c.hint}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Title <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
        </span>
        <input name="title" defaultValue={p?.title ?? ""} maxLength={120} className="input-base" placeholder="Give it a short headline" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">What do you want to share?</span>
        <textarea
          name="content"
          rows={6}
          required
          maxLength={4000}
          defaultValue={p?.content ?? ""}
          className="input-base resize-y"
          placeholder="Write it like you'd say it…"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Image URL <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="imageUrl" type="url" defaultValue={p?.imageUrl ?? ""} className="input-base" placeholder="https://…" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">
            Location <span className="font-normal text-[color:var(--color-ink-faint)]">(optional)</span>
          </span>
          <input name="location" defaultValue={p?.location ?? ""} maxLength={120} className="input-base" placeholder="e.g. Main gate, Library" />
        </label>
      </div>

      {state && "error" in state && state.error ? <FormBanner kind="error">{state.error}</FormBanner> : null}
      <div className="flex items-center justify-end gap-2">
        <SubmitButton pending={pending} pendingLabel={props.mode === "edit" ? "Saving…" : "Posting…"}>
          {props.mode === "edit" ? "Save changes" : "Post to campus"}
        </SubmitButton>
      </div>
    </form>
  );
}

function createAction(_prev: State, formData: FormData) {
  return createPostAction(formData).catch((e) => {
    if (isRedirect(e)) throw e;
    return { ok: false as const, error: "Could not publish the post." };
  });
}

type State = ActionResult | { error?: string } | Record<string, never>;

function isRedirect(e: unknown): boolean {
  return typeof e === "object" && e !== null && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}

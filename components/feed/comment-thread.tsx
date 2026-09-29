"use client";

import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { addCommentAction } from "@/components/feed/actions";
import { relativeTime } from "@/lib/format";

type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  mine: boolean;
};

export function CommentThread({ postId, comments }: { postId: string; comments: CommentData[] }) {
  const [items, addOptimistic] = useOptimistic(comments, (state, next: CommentData) => [...state, next]);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;
    formRef.current?.reset();
    startTransition(async () => {
      addOptimistic({
        id: `optimistic-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        author: { id: "me", name: "You", image: null },
        mine: true,
      });
      const res = await addCommentAction(postId, formData);
      if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <section className="mt-3">
      <h2 className="font-display mb-2 px-1 text-[14px] font-bold">Comments</h2>

      {items.length === 0 ? (
        <p className="card-surface px-4 py-6 text-center text-[13px] text-[color:var(--color-ink-soft)]">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((c) => (
            <li key={c.id} className="card-surface flex gap-2.5 px-3.5 py-3">
              <Link href={`/profile/${c.author.id}`} className="rounded-full">
                <Avatar name={c.author.name} image={c.author.image} size={28} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <Link href={`/profile/${c.author.id}`} className="truncate text-[13px] font-semibold hover:underline">
                    {c.author.name}
                  </Link>
                  <span className="shrink-0 text-[11px] text-[color:var(--color-ink-faint)]">{relativeTime(c.createdAt)}</span>
                </p>
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={submit} className="mt-3 flex items-end gap-2">
        <input type="hidden" name="postId" value={postId} />
        <textarea
          name="content"
          rows={1}
          required
          maxLength={1000}
          placeholder="Add a comment…"
          className="input-base flex-1 resize-none py-2.5"
        />
        <button type="submit" className="btn-solid h-10 w-10 !px-0" aria-label="Send comment">
          <Icon.arrowRight size={16} />
        </button>
      </form>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useOptimistic, useRef, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { createGroupPostAction } from "@/components/cards/group-actions";
import { relativeTime } from "@/lib/format";

type WallPost = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
};

export function GroupWall({ groupId, posts }: { groupId: string; posts: WallPost[] }) {
  const [items, addOptimistic] = useOptimistic(posts, (state, next: WallPost) => [next, ...state]);
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
      });
      const res = await createGroupPostAction(groupId, formData);
      if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <div>
      <form ref={formRef} action={submit} className="card-surface mb-3 flex items-end gap-2 px-3.5 py-3">
        <input type="hidden" name="groupId" value={groupId} />
        <textarea
          name="content"
          rows={1}
          required
          maxLength={1000}
          placeholder="Share something with the group…"
          className="input-base flex-1 resize-none border-0 bg-transparent px-0 focus:border-0"
          style={{ border: "none" }}
        />
        <button type="submit" className="btn-solid h-9 w-9 !px-0" aria-label="Post to group">
          <Icon.arrowRight size={15} />
        </button>
      </form>

      {items.length === 0 ? (
        <p className="card-surface px-4 py-6 text-center text-[13px] text-[color:var(--color-ink-soft)]">
          No posts yet — start the discussion.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((p) => (
            <li key={p.id} className="card-surface flex gap-2.5 px-3.5 py-3">
              <Link href={`/profile/${p.author.id}`} className="rounded-full">
                <Avatar name={p.author.name} image={p.author.image} size={28} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <Link href={`/profile/${p.author.id}`} className="truncate text-[13px] font-semibold hover:underline">
                    {p.author.name}
                  </Link>
                  <span className="shrink-0 text-[11px] text-[color:var(--color-ink-faint)]">{relativeTime(p.createdAt)}</span>
                </p>
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{p.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

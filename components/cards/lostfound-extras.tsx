"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { startConversationAction } from "@/components/cards/listing-actions";

export function LostFoundContactButton({
  itemId,
  authorId,
  authorName,
  mine,
}: {
  itemId: string;
  authorId: string;
  authorName: string;
  mine: boolean;
}) {
  const [pending, startTransition] = useTransition();
  if (mine) return null;

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await startConversationAction(authorId, itemId);
          if (res.ok) toast.success(`Messaging ${authorName.split(" ")[0]} — check Messages`);
          else toast.error(res.error);
        })
      }
      className="btn-outline h-7 px-2.5 text-[12px]"
    >
      {pending ? "…" : "Message"}
    </button>
  );
}

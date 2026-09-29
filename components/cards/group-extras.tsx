"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { toggleMembershipAction } from "@/components/cards/group-actions";
import { cn } from "@/lib/utils";

export function GroupJoinButton({ groupId, initialJoined }: { groupId: string; initialJoined: boolean }) {
  const [joined, setJoined] = useState(initialJoined);
  const [, startTransition] = useTransition();

  function toggle() {
    setJoined(!joined);
    startTransition(async () => {
      const res = await toggleMembershipAction(groupId);
      if (!res.ok) {
        setJoined(joined);
        toast.error(res.error);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={joined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition active:scale-[0.97]",
        joined
          ? "border border-[color:var(--color-pine)] bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]"
          : "btn-solid h-8",
      )}
    >
      {joined ? <Icon.check size={13} /> : <Icon.plus size={13} />}
      {joined ? "Joined" : "Join"}
    </button>
  );
}

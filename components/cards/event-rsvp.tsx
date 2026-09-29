"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { rsvpAction } from "@/components/cards/event-actions";
import { cn } from "@/lib/utils";

export function EventRsvpButton({ eventId, initialRsvp, past }: { eventId: string; initialRsvp: boolean; past: boolean }) {
  const [going, setGoing] = useState(initialRsvp);
  const [, startTransition] = useTransition();

  function toggle() {
    setGoing(!going);
    startTransition(async () => {
      const res = await rsvpAction(eventId);
      if (!res.ok) {
        setGoing(going);
        toast.error(res.error);
      }
    });
  }

  if (past) {
    return (
      <span className="inline-flex h-8 items-center rounded-lg border border-[color:var(--color-line)] px-3 text-[12.5px] text-[color:var(--color-ink-faint)]">
        Ended
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={going}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition active:scale-[0.97]",
        going
          ? "border border-[color:var(--color-pine)] bg-[color:var(--color-pine-soft)] text-[color:var(--color-pine-deep)]"
          : "btn-solid h-8",
      )}
    >
      {going ? <Icon.check size={13} /> : <Icon.ticket size={13} />}
      {going ? "Going" : "RSVP"}
    </button>
  );
}

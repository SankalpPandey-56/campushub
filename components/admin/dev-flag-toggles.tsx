"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { toggleFlagAction } from "@/app/(admin)/admin/dev/actions";
import { FLAG_LABELS, type FlagKey } from "@/lib/flags";

export function DevFlagToggles({ flags }: { flags: Record<FlagKey, boolean> }) {
  const [state, setState] = useState(flags);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(key: FlagKey) {
    const next = !state[key];
    setState((s) => ({ ...s, [key]: next })); // optimistic
    setPendingKey(key);
    startTransition(async () => {
      const res = await toggleFlagAction(key, next);
      setPendingKey(null);
      if (!res.ok) {
        setState((s) => ({ ...s, [key]: !next }));
        toast.error(res.error);
      } else {
        toast.success(`${FLAG_LABELS[key].title} ${next ? "enabled" : "disabled"}`);
      }
    });
  }

  return (
    <ul className="mt-3 space-y-2">
      {(Object.keys(FLAG_LABELS) as FlagKey[]).map((key) => {
        const meta = FLAG_LABELS[key];
        const on = state[key];
        return (
          <li key={key} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white/85">{meta.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/40">{meta.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={on}
              aria-label={meta.title}
              disabled={pendingKey === key}
              onClick={() => toggle(key)}
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition ${
                on ? "border-[#3f7f63] bg-[#3f7f63]/40" : "border-white/20 bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 size-4.5 w-[18px] rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

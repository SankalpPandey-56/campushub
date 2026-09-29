"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import {
  expireStaleDealsAction,
  purgeReadNotificationsAction,
  purgeDemoDataAction,
  type MaintenanceResult,
} from "@/app/(admin)/admin/dev/actions";
import { Icon } from "@/components/icons";

type Tool = {
  key: string;
  label: string;
  description: string;
  confirm: string;
  run: () => Promise<MaintenanceResult>;
  danger?: boolean;
};

const TOOLS: Tool[] = [
  {
    key: "deals",
    label: "Clean up stale deals",
    description: "Deletes deals that expired more than 30 days ago. They already show as expired — this removes the clutter.",
    confirm: "Delete all deals expired 30+ days ago?",
    run: expireStaleDealsAction,
  },
  {
    key: "notifications",
    label: "Clear old notifications",
    description: "Deletes notifications that were read more than 30 days ago. Unread ones are kept.",
    confirm: "Delete all read notifications older than 30 days?",
    run: purgeReadNotificationsAction,
  },
  {
    key: "demo",
    label: "Purge demo data",
    description:
      "Removes the seeded demo users and everything they created (posts, deals, events, listings, groups). For when you launch with real students.",
    confirm: "PERMANENT: delete all seeded demo users and their content. Continue?",
    run: purgeDemoDataAction,
    danger: true,
  },
];

export function DevMaintenance() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(tool: Tool) {
    setConfirmKey(null);
    setPendingKey(tool.key);
    startTransition(async () => {
      const res = await tool.run();
      setPendingKey(null);
      if (res.ok) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  return (
    <ul className="mt-3 space-y-2">
      {TOOLS.map((tool) => (
        <li key={tool.key} className="rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white/85">{tool.label}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/40">{tool.description}</p>
            </div>
            {confirmKey === tool.key ? (
              <span className="flex shrink-0 gap-1.5">
                <button
                  disabled={pendingKey === tool.key}
                  onClick={() => run(tool)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50 ${
                    tool.danger ? "bg-[#c9564a] hover:bg-[#b8483c]" : "bg-[#3f7f63] hover:bg-[#478c6e]"
                  }`}
                >
                  {pendingKey === tool.key ? "Running…" : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmKey(null)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/60"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmKey(tool.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition ${
                  tool.danger
                    ? "border-[#c9564a]/50 text-[#e89a8a] hover:bg-[#c9564a]/10"
                    : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                }`}
              >
                {tool.danger ? <Icon.trash size={13} /> : null}
                Run
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

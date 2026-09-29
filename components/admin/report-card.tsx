"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveReportAction } from "@/app/(admin)/admin/actions";
import { Icon } from "@/components/icons";

const TARGET_LABEL: Record<string, string> = {
  POST: "Post",
  DEAL: "Deal",
  EVENT: "Event",
  RESOURCE: "Resource",
  LISTING: "Listing",
  LOST_FOUND: "Lost & found",
  USER: "User",
};

export function ReportCard(props: {
  id: string;
  targetType: string;
  targetId: string;
  targetPreview: string | null;
  reason: string;
  details: string | null;
  reporter: string;
  when: string;
  resolved: boolean;
  actionTaken: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function act(outcome: "DISMISSED" | "ACTIONED", mode?: "content" | "user_only") {
    startTransition(async () => {
      await resolveReportAction(props.id, outcome, mode ?? (props.targetType === "USER" ? "user_only" : "content"));
      router.refresh();
    });
  }

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-[#c9564a]/20 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#e89a8a]">
          {props.reason}
        </span>
        <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/60">
          {TARGET_LABEL[props.targetType] ?? props.targetType}
        </span>
        <span className="ml-auto text-[11.5px] text-white/40">
          by {props.reporter} · {new Date(props.when).toLocaleDateString("en-IN")}
        </span>
      </div>

      {props.targetPreview ? (
        <p className="mt-3 rounded-lg bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white/70">
          {props.targetPreview}
          {props.targetPreview === null ? <span className="italic">(content already removed)</span> : null}
        </p>
      ) : (
        <p className="mt-3 text-[12px] italic text-white/40">(content already removed)</p>
      )}

      {props.details ? (
        <p className="mt-2 text-[12.5px] text-white/55">
          <span className="font-semibold text-white/70">Reporter says: </span>
          {props.details}
        </p>
      ) : null}

      {props.resolved ? (
        <p className="mt-3 text-[12px] font-medium text-[#8fd0b1]">✓ {props.actionTaken ?? "Resolved"}</p>
      ) : (
        <div className="mt-3.5 flex flex-wrap gap-2">
          <button
            disabled={pending}
            onClick={() => act("DISMISSED")}
            className="rounded-lg border border-white/15 px-3.5 py-2 text-[12.5px] font-semibold text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-50"
          >
            Dismiss
          </button>
          {props.targetType !== "USER" ? (
            <button
              disabled={pending}
              onClick={() => act("ACTIONED", "content")}
              className="rounded-lg bg-[#c9564a] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#b8483c] disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1.5"><Icon.trash size={13} /> Remove content</span>
            </button>
          ) : null}
          {props.targetType === "USER" ? (
            <button
              disabled={pending}
              onClick={() => act("ACTIONED", "user_only")}
              className="rounded-lg bg-[#c9564a] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#b8483c] disabled:opacity-50"
            >
              Suspend user
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}

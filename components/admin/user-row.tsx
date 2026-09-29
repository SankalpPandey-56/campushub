"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suspendUserAction, restoreUserAction } from "@/app/(admin)/admin/actions";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-[#3f7f63]/25 text-[#8fd0b1] border-[#3f7f63]/40",
  PENDING: "bg-[#e8c46a]/15 text-[#e8c46a] border-[#e8c46a]/30",
  REJECTED: "bg-white/10 text-white/50 border-white/20",
  SUSPENDED: "bg-[#c9564a]/20 text-[#e89a8a] border-[#c9564a]/40",
};

export function UserRow(props: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  status: string;
  course: string | null;
  year: string | null;
  campus: string | null;
  postCount: number;
  commentCount: number;
  joined: string;
  suspendedReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function suspend() {
    const reason = window.prompt(`Reason for suspending ${props.name} (visible to them):`) ?? "";
    if (!reason) return;
    startTransition(async () => {
      await suspendUserAction(props.id, reason);
      router.refresh();
    });
  }

  function restore() {
    startTransition(async () => {
      await restoreUserAction(props.id);
      router.refresh();
    });
  }

  return (
    <div className="bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar name={props.name} image={props.image} size={32} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold">
            <span className="truncate">{props.name}</span>
            {props.role === "ADMIN" ? (
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70">admin</span>
            ) : null}
          </p>
          <p className="truncate text-[12px] text-white/45">{props.email ?? props.phone ?? "—"}</p>
        </div>
        <span className={`hidden rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:inline-block ${STATUS_STYLE[props.status]}`}>
          {props.status}
        </span>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle details"
          className="inline-flex size-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
        >
          <Icon.chevronDown size={15} className={open ? "rotate-180 transition" : "transition"} />
        </button>
      </div>

      {open ? (
        <div className="mt-3 rounded-lg bg-white/[0.03] px-4 py-3.5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
            {[
              ["Email", props.email ?? "—"],
              ["Phone", props.phone ?? "—"],
              ["Course", props.course ?? "—"],
              ["Year", props.year ?? "—"],
              ["Campus", props.campus ?? "—"],
              ["Joined", new Date(props.joined).toLocaleDateString("en-IN")],
              ["Posts", String(props.postCount)],
              ["Comments", String(props.commentCount)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35">{k}</dt>
                <dd className="truncate text-[12.5px] text-white/75">{v}</dd>
              </div>
            ))}
          </dl>

          {props.suspendedReason ? (
            <p className="mt-2.5 text-[12px] text-[#e89a8a]">Suspended: {props.suspendedReason}</p>
          ) : null}

          {props.role !== "ADMIN" ? (
            <div className="mt-3 flex gap-2">
              {props.status === "SUSPENDED" ? (
                <button
                  disabled={pending}
                  onClick={restore}
                  className="rounded-lg bg-[#3f7f63] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                >
                  Restore access
                </button>
              ) : props.status === "APPROVED" ? (
                <button
                  disabled={pending}
                  onClick={suspend}
                  className="rounded-lg border border-[#c9564a]/50 px-3 py-1.5 text-[12px] font-semibold text-[#e89a8a] hover:bg-[#c9564a]/10 disabled:opacity-50"
                >
                  Suspend user
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

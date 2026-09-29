"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideVerificationAction } from "@/app/(admin)/admin/actions";
import { Icon } from "@/components/icons";

export function VerificationCard(props: {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  course: string;
  year: string;
  campus: string;
  collegeEmail: string | null;
  extraInfo: string | null;
  submitted: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();

  function decide(decision: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const res = await decideVerificationAction(props.id, decision);
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    });
  }

  const rows: Array<[string, string | null]> = [
    ["Name", props.fullName],
    ["Email", props.email],
    ["Phone", props.phone],
    ["Course", `${props.course}${props.year ? ` · Year ${props.year}` : ""}`],
    ["Campus", props.campus],
    ["College email", props.collegeEmail],
    ["Submitted", new Date(props.submitted).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
  ];

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold">{props.fullName}</h2>
          <p className="text-[12.5px] text-white/50">
            {props.course} · Year {props.year} · {props.campus}
          </p>
        </div>
        {done ? (
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-white/70">Done — refresh to update</span>
        ) : (
          <div className="flex gap-2">
            <button
              disabled={pending}
              onClick={() => decide("APPROVED")}
              className="rounded-lg bg-[#3f7f63] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#478c6e] disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1.5"><Icon.check size={14} /> Approve</span>
            </button>
            <button
              disabled={pending}
              onClick={() => {
                const note = window.prompt("Reason for rejection (shared with the student):") ?? "";
                decide("REJECTED");
                void note;
              }}
              className="rounded-lg border border-white/15 px-3.5 py-2 text-[12.5px] font-semibold text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/35">{k}</dt>
              <dd className="truncate text-[12.5px] text-white/75">{v}</dd>
            </div>
          ))}
      </dl>

      {props.extraInfo ? (
        <p className="mt-3 rounded-lg bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white/60">
          <span className="font-semibold text-white/70">Extra info: </span>
          {props.extraInfo}
        </p>
      ) : null}
    </article>
  );
}

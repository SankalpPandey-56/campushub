"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { ReportDialog } from "@/components/moderation/report-dialog";
import { startConversationAction } from "@/components/cards/listing-actions";

export function ListingContactButton({
  listingId,
  sellerId,
  sellerName,
  mine,
  sold,
}: {
  listingId: string;
  sellerId: string;
  sellerName: string;
  mine: boolean;
  sold: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [reportOpen, setReportOpen] = useState(false);

  if (mine) {
    return (
      <button
        onClick={() => setReportOpen(true)}
        aria-label="Report listing"
        className="inline-flex size-7 items-center justify-center rounded-md text-[color:var(--color-ink-faint)] hover:bg-[color:var(--color-paper-deep)]"
      >
        <Icon.flag size={13} />
      </button>
    );
  }

  return (
    <>
      <button
        disabled={pending || sold}
        onClick={() =>
          startTransition(async () => {
            const res = await startConversationAction(sellerId, listingId);
            if (res.ok) toast.success(`Message sent to ${sellerName.split(" ")[0]} — check Messages`);
            else toast.error(res.error);
          })
        }
        className="btn-solid h-7 px-2.5 text-[12px] disabled:opacity-50"
      >
        {sold ? "Sold" : pending ? "…" : "Contact"}
      </button>
      <button
        onClick={() => setReportOpen(true)}
        aria-label="Report listing"
        className="inline-flex size-7 items-center justify-center rounded-md text-[color:var(--color-ink-faint)] hover:bg-[color:var(--color-paper-deep)]"
      >
        <Icon.flag size={13} />
      </button>
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="LISTING" targetId={listingId} />
    </>
  );
}
